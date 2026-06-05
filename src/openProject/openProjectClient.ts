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

  /**
   * Creates tasks in OpenProject based on the LLM response.
   * The LLM response should be a JSON array of task objects.
   * Each task object should have a 'taskType' property and optionally 'children' for nested tasks.
   *
   * @throws {Error} if the LLM response is invalid or if task creation fails
   */
  public async createTaskFromLlmResponse(
    llmResponse: string,
    availableTasks: Task[],
    project: Project,
  ): Promise<void> {
    let parsedResponse: any[]
    try {
      parsedResponse = JSON.parse(llmResponse)
    } catch (error) {
      throw new Error(`Ungültiges JSON in der LLM-Antwort: ${(error as Error).message}`)
    }

    if (!Array.isArray(parsedResponse)) {
      throw new Error("Die LLM-Antwort muss ein JSON-Array sein.")
    }

    for (const taskData of parsedResponse) {
      await this.processSingleTask(taskData, availableTasks, project)
    }
  }

  private async processSingleTask(
    taskData: any,
    availableTasks: Task[],
    project: Project,
    parentTaskId?: number,
  ): Promise<void> {
    // Find matching task type
    const taskType = taskData.taskType
    if (!taskType) {
      console.warn("Task data missing 'taskType':", taskData)
      return
    }

    const matchedTask = availableTasks.find((t) => t.name === taskType)
    if (!matchedTask) {
      console.warn(`No matching task type found for: ${taskType}`)
      return
    }

    // Build payload
    const payload: any = {
      _links: {
        project: { href: project.url },
        type: { href: matchedTask.url },
      },
    }

    for (const [key, value] of Object.entries(taskData)) {
      if (key === "taskType" || key === "children") continue

      const attributeData = matchedTask.data[key]
      if (!attributeData) continue
      if (key === "description") {
        payload[key] = { raw: value }
        continue
      }

      if (attributeData.location === "_links") {
        payload._links[key] = { href: String(value) }
      } else {
        payload[key] = value
      }
    }

    // Add parent link if applicable
    if (parentTaskId) {
      payload._links.parent = { href: `/api/v3/work_packages/${parentTaskId}` }
    }

    try {
      const response: Response = await this.request("work_packages", "POST", payload)

      if (response.status === 201) {
        const responseData = await response.json()
        const currentTaskId = responseData.id

        // Handle nested children if they exist
        if (Array.isArray(taskData.children)) {
          for (const child of taskData.children) {
            await this.processSingleTask(child, availableTasks, project, currentTaskId)
          }
        }
      } else {
        console.warn(`Fehler beim Erstellen des Tasks: ${response.statusText}`)
      }
    } catch (error) {
      console.warn(`Fehler beim Erstellen des Tasks: ${(error as Error).message}`)
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
