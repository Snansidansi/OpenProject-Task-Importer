import { getValue, StorageKey } from "../storage"
import type { Project, Task, TaskAttributeData, TaskMetadata } from "./openProjectTypes"

class OpenProjectClient {
  private readonly getBaseUrl: () => Promise<string | null> | string
  private readonly getToken: () => Promise<string | null> | string

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
      id: project._links.self.href,
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
  public async getTaskDetails(taskURL: string): Promise<Task> {
    const body = {
      _links: {
        type: { href: taskURL },
      },
    }

    const response: Response = await this.request("work_packages/form", "POST", body)
    const rawData = await response.json()

    const payload = rawData._embedded?.payload ?? {}
    const schema = rawData._embedded?.schema ?? {}

    const taskName = payload._links?.type?.title
    if (!taskName) throw new Error("Task name not found")

    const blacklist = [
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
      "subject",
      "parent",
      "status",
      "sprint",
      "version",
      "category",
      "priority",
      "type",
    ]

    const taskData: Record<string, TaskAttributeData> = {}

    Object.keys(schema).forEach((key) => {
      const field = schema[key]

      if (field && field.writable === true && !blacklist.includes(key)) {
        const isRequired = field.required ?? false

        taskData[field.name] = {
          required: isRequired,
          allowedForLLM: isRequired,
          llmNote: "",
          type: field.type,
        }
      }
    })

    return {
      name: taskName,
      url: taskURL,
      data: taskData,
    }
  }
}

export const openProjectClient = new OpenProjectClient(
  async () => `${await getValue(StorageKey.OpenProjectUrl)}`,
  () => getValue(StorageKey.OpenProjectApiKey),
)
