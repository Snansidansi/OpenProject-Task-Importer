import { getValue, StorageKey } from "../storage"
import type { Project, TaskMetadata } from "./openProjectTypes"

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
  public async getTaskNames() {
    const response: Response = await this.request("types", "GET")

    const rawData = await response.json()
    const elements = rawData._embedded?.elements ?? []
    const taskNames: TaskMetadata[] = elements.map((task: any) => ({
      name: task.name,
      url: task._links.self.href,
    }))

    return taskNames
  }
}

export const openProjectClient = new OpenProjectClient(
  async () => `${await getValue(StorageKey.OpenProjectUrl)}`,
  () => getValue(StorageKey.OpenProjectApiKey),
)
