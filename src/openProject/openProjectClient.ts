import { getValue, StorageKey } from "../storage"
import type { Project } from "./openProjectTypes"

class OpenProjectClient {
  private readonly baseUrl: () => Promise<string | null> | string
  private readonly getToken: () => Promise<string | null> | string

  constructor(
    getBaseUrl: () => Promise<string | null> | string,
    getToken: () => Promise<string | null> | string,
  ) {
    this.baseUrl = getBaseUrl
    this.getToken = getToken
  }

  /**
   * @throws {Error} if the request fails
   */
  public async getProjects() {
    const url = `${await this.baseUrl()}/projects`

    let response: Response

    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getToken()}`,
        },
      })
    } catch (error) {
      throw new Error(`failed to fetch url with get: ${url}`, { cause: error })
    }

    if (!response.ok) throw new Error(`API Error: ${response.statusText}\nUrl: ${url}`)

    const rawData = await response.json()
    const elements = rawData._embedded?.elements ?? []
    const projects: Project[] = elements.map((project: any) => ({
      id: project.id,
      name: project.name,
    }))

    return projects
  }
}

export const openProjectClient = new OpenProjectClient(
  async () => `http://${await getValue(StorageKey.OpenProjectUrl)}/api/v3`,
  () => getValue(StorageKey.OpenProjectApiKey),
)
