import { showInfo } from "../infoStore"
import { getValue, StorageKey } from "../storage"
import type {
  AttributeValues,
  Project,
  Task,
  TaskAttributeData,
  TaskMetadata,
  User,
} from "./openProjectTypes"

class OpenProjectClient {
  private readonly getBaseUrl: () => Promise<string | null> | string
  private readonly getToken: () => Promise<string | null> | string
  private readonly workPackageTypeBlacklist = [
    "_links",
    "_dependencies",
    "_attributeGroups",
    "id",
    "lockVersion",
    "createdAt",
    "updatedAt",
    "subject",
    "scheduleManually",
    "ignoreNonWorkingDays",
    "remainingTime",
    "percentageDone",
    "project",
    "parent",
    "status",
    "sprint",
    "version",
    "category",
    "priority",
    "type",
  ]
  private readonly workPackageTypeBlackList = ["Version"]

  constructor(
    getBaseUrl: () => Promise<string | null> | string,
    getToken: () => Promise<string | null> | string,
  ) {
    this.getBaseUrl = getBaseUrl
    this.getToken = getToken
  }

  private async request(urlSuffix: string, method: "GET" | "POST", body?: any) {
    let response: Response
    const url = (await this.getBaseUrl()) + "/api/v3/" + urlSuffix
    try {
      response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getToken()}`,
        },
        ...(body && { body: JSON.stringify(body) }),
      })
    } catch (error) {
      throw new Error(`failed to fetch url with ${method}: ${url}`, { cause: error })
    }

    if (!response.ok) throw new Error(`API Error: ${response.statusText}\nUrl: ${url}`)
    return response
  }

  /**
   * @throws {Error} if the request fails
   */
  public async getProjects() {
    const response: Response = await this.request("projects", "GET")

    const rawData = await response.json()
    const elements = rawData._embedded?.elements ?? []
    const projects: Project[] = elements.map((project: any) => ({
      url: project._links.self.href,
      name: project.name,
    }))

    return projects
  }

  /**
   * @throws {Error} if the request fails
   */
  public async getTaskNames(): Promise<TaskMetadata[]> {
    const response: Response = await this.request("types", "GET")

    const rawData = await response.json()
    const elements = rawData._embedded?.elements ?? []
    const taskNames: TaskMetadata[] = elements.map((task: any) => ({
      name: task.name,
      url: task._links.self.href,
    }))

    return taskNames
  }

  /**
   * @throws {Error} if the request fails
   */
  public async getTaskDetails(taskURL: string, referenceProjectURL: string): Promise<Task> {
    const body = {
      _links: {
        type: { href: taskURL },
        project: { href: referenceProjectURL },
      },
    }

    const response: Response = await this.request("work_packages/form", "POST", body)
    const rawData = await response.json()

    const payload = rawData._embedded?.payload ?? {}
    const schema = rawData._embedded?.schema ?? {}

    const taskName = payload._links?.type?.title
    if (!taskName) throw new Error("Task name not found")

    const taskData: Record<string, TaskAttributeData> = {}

    Object.keys(schema).forEach((attributeName) => {
      const field = schema[attributeName]

      if (
        field &&
        field.writable === true &&
        !this.workPackageTypeBlacklist.includes(attributeName) &&
        !this.workPackageTypeBlackList.includes(field.type)
      ) {
        const isRequired = field.required ?? false

        taskData[attributeName] = {
          name: field.name,
          required: isRequired,
          allowedForLLM: isRequired,
          type: field.type,
          location: field.location,
        }

        const allowedValues: any[] = field._embedded?.allowedValues
        const values: AttributeValues[] = []
        allowedValues?.forEach((entry) => {
          if (entry._type === "CustomOption") {
            const href = entry._links?.self?.href

            if (href) {
              values.push({
                name: entry.value,
                value: href,
                type: "link",
              })
            }
          }
        })

        if (values.length > 0) {
          taskData[attributeName].values = values
        }
      }
    })

    return {
      name: taskName,
      url: taskURL,
      data: taskData,
    }
  }

  /**
   * Fetches updated task details and merges them with the provided task.
   * - Fields missing in the new task are removed.
   * - Fields present in the new task but not in the old one are added with default values.
   * - Fields present in both retain the old task's values.
   *
   * @returns Boolean if the basic schema was changed. If a TaskAttibute.values field changes it will still return false!
   * @throws {Error} if the request fails
   */
  public async updateTaskDetails(
    task: Task,
    referenceProjectURL: string,
  ): Promise<{ task: Task; taskChanged: Boolean }> {
    const newTask = await this.getTaskDetails(task.url, referenceProjectURL)
    const mergedData: Record<string, TaskAttributeData> = {}

    const allKeys = new Set([...Object.keys(task.data), ...Object.keys(newTask.data)])

    let taskChanged = false
    for (const key of allKeys) {
      const oldData = task.data[key]
      const newData = newTask.data[key]

      if (oldData && newData) {
        mergedData[key] = oldData
        mergedData[key].values = newData.values
      } else if (newData) {
        mergedData[key] = newData
        taskChanged = true
      } else if (oldData) {
        taskChanged = true
      }
    }

    if (newTask.name !== task.name) {
      taskChanged = true
    }
    return {
      task: {
        name: newTask.name,
        url: newTask.url,
        data: mergedData,
      },
      taskChanged: taskChanged,
    }
  }

  public async getUsersForProject(project: Project): Promise<User[]> {
    const response: Response = await this.request(
      `projects/${project.url.split("/").pop()}/available_assignees`,
      "GET",
    )

    const rawData = await response.json()
    const elements = rawData._embedded?.elements ?? []
    const users: User[] = elements.map((user: any) => ({
      name: user.name,
      url: user._links?.self?.href,
    }))

    return users
  }
}

export const openProjectClient = new OpenProjectClient(
  async () => `${await getValue(StorageKey.OpenProjectUrl)}`,
  () => getValue(StorageKey.OpenProjectApiKey),
)
