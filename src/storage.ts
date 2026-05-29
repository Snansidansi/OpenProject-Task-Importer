export enum StorageKey {
  OpenProjectUrl = "OpenProjectUrl",
  OpenProjectApiKey = "OpenProjectApiKey",
  OpenRouterApiKey = "OpenRouterApiKey",
  AiModel = "AiModel",
  AiPrompt = "Prompt",
}

type LocalKeys = StorageKey.OpenProjectApiKey | StorageKey.OpenRouterApiKey

function isLocalKey(key: StorageKey): key is LocalKeys {
  return key === StorageKey.OpenProjectApiKey || key === StorageKey.OpenRouterApiKey
}

export async function saveValue(key: StorageKey, value: string | null): Promise<void> {
  if (isLocalKey(key)) {
    await chrome.storage.local.set({ [key]: value })
  } else {
    await chrome.storage.sync.set({ [key]: value })
  }
}

export async function getValue(key: StorageKey): Promise<string | null> {
  const storage = isLocalKey(key) ? chrome.storage.local : chrome.storage.sync
  const result = await storage.get([key])
  return (result[key] as string | null) || null
}
