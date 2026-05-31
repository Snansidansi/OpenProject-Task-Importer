export enum StorageKey {
  OpenProjectUrl = "OpenProjectUrl",
  OpenProjectApiKey = "OpenProjectApiKey",
  OpenRouterApiKey = "OpenRouterApiKey",
  AiModel = "AiModel",
  AiPrompt = "Prompt",
  OpenProjectTasks = "OpenProjectTasks",
}

export async function saveValue(key: StorageKey, value: any): Promise<void> {
  await chrome.storage.local.set({ [key]: value })
}

export async function getValue<T = string>(key: StorageKey): Promise<T | null> {
  const result = await chrome.storage.local.get([key])
  return (result[key] as T) ?? null
}
