type TokenProvider = () => string | null | undefined

export function createApiClient(
  baseUrl: string,
  getToken: TokenProvider,
  authPrefix: String = "Bearer ",
) {
  return async <T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    body?: unknown,
  ): Promise<T> => {
    const token = getToken()

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `${authPrefix}${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`)
    return response.json()
  }
}
