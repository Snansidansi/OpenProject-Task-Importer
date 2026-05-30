export enum StorageKey {
  OpenProjectUrl = "OpenProjectUrl",
  OpenProjectApiKey = "OpenProjectApiKey",
  OpenRouterApiKey = "OpenRouterApiKey",
  AiModel = "AiModel",
  AiPrompt = "Prompt",
}

export async function saveValue(key: StorageKey, value: string | null): Promise<void> {
  await chrome.storage.local.set({ [key]: value })
}

export async function getValue(key: StorageKey): Promise<string | null> {
  const result = await chrome.storage.local.get([key])
  return (result[key] as string | null) || null
}
