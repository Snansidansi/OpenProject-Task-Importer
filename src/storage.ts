export enum StorageKey {
  OpenProjectUrl = "OpenProjectUrl",
  OpenProjectApiKey = "OpenProjectApiKey",
  OpenRouterApiKey = "OpenRouterApiKey",
  AiModel = "AiModel",
  AiPrompt = "Prompt",
  OpenProjectTasks = "OpenProjectTasks",
  ReferenceProject = "ReferenceProject",
  ActiveImports = "ActiveImports",
}

export interface ActiveImport {
  id: string
  fileName: string
}

export async function saveValue(key: StorageKey, value: any): Promise<void> {
  await chrome.storage.local.set({ [key]: value })
}

export async function getValue<T = string>(key: StorageKey): Promise<T | null> {
  const result = await chrome.storage.local.get([key])
  return (result[key] as T) ?? null
}

export async function exportSettings(): Promise<void> {
  const allData: Record<string, any> = {}
  for (const key in StorageKey) {
    const storageKey = StorageKey[key as keyof typeof StorageKey]
    const value = await getValue(storageKey)
    if (value !== null) {
      allData[storageKey] = value
    }
  }

  const jsonString = JSON.stringify(allData, null, 2)
  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "settings-export.json"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function importSettings(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string
        const data = JSON.parse(content)

        for (const key in data) {
          if (Object.values(StorageKey).includes(key as StorageKey)) {
            await saveValue(key as StorageKey, data[key])
          }
        }

        resolve()
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
