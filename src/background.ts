import type { Project, Task, User } from "./openProject/openProjectTypes"
import { openProjectClient } from "./openProject/openProjectClient"
import { getValue, saveValue, StorageKey } from "./storage"
import { defaultSystemPrompt, defaultTypes, LlmRequest } from "./llmRequest"
import { extractTextFromPdf } from "./textExtractor"
import { OpenRouter } from "@openrouter/sdk"
import type { ChatResult } from "@openrouter/sdk/models"

export type BackgroundOperationMessage = StartProcessing | StopProcessing

export type StartProcessing = {
  type: "StartProcessing"
  fileData: string
  selectedProject: Project
}

export type StopProcessing = {
  type: "StopProcessing"
}

let abortController: AbortController | null = null

chrome.runtime.onMessage.addListener((message: BackgroundOperationMessage, _, sendResponse) => {
  switch (message.type) {
    case "StartProcessing":
      if (abortController) {
        abortController.abort()
      }

      abortController = new AbortController()
      const signal = abortController.signal

      startProcessing(message, signal)
        .then((result) => {
          sendResponse(result)
        })
        .catch((error) => {
          if ((error as Error).name !== "AbortError") {
            sendResponse("Unexpected Error: " + (error as Error).message)
          } else {
            sendResponse("Import abgebrochen")
          }
        })
        .finally(() => {
          if (abortController?.signal === signal) {
            abortController = null
          }
        })

      return true
    case "StopProcessing":
      abortController?.abort()
  }
})

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

async function startProcessing(message: StartProcessing, signal: AbortSignal): Promise<string> {
  const openRouterKey = await getValue(StorageKey.OpenRouterApiKey)
  if (!openRouterKey) {
    return "Bitte einen API Schlüssel für OpenRouter festlegen."
  }

  const aiModel = await getValue(StorageKey.AiModel)
  if (!aiModel || aiModel.trim() === "") {
    return "Bitte ein Ki-Modell festlegen"
  }

  if (signal.aborted) throw new DOMException("Aborted", "AbortError")

  const arrayBuffer = base64ToArrayBuffer(message.fileData)
  const file = new File([arrayBuffer], "document.pdf", { type: "application/pdf" })
  let extractedText: string
  try {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError")
    extractedText = await extractTextFromPdf(file)
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error
    return (error as Error).message
  }

  if (signal.aborted) throw new DOMException("Aborted", "AbortError")

  const availableTasks = await refreshAndGetTaskSchemas(message.selectedProject)
  if (typeof availableTasks === "string") {
    return availableTasks
  }
  const availableUsers = await openProjectClient.getUsersForProject(message.selectedProject)
  const userPrompt = await getValue(StorageKey.AiPrompt)

  if (signal.aborted) throw new DOMException("Aborted", "AbortError")

  const llmPrompt = buildLllmPrompt(
    { ...message, extractedText },
    availableTasks,
    availableUsers,
    userPrompt,
  )

  const client = new OpenRouter({
    apiKey: openRouterKey,
  })

  let llmReponse: ChatResult
  try {
    llmReponse = await client.chat.send(
      {
        chatRequest: {
          model: aiModel.trim(),
          messages: [{ role: "system", content: llmPrompt }],
        },
      },
      { fetchOptions: { signal } },
    )
  } catch (error) {
    if ((error as Error).name === "AbortError" || signal.aborted) {
      throw new DOMException("Aborted", "AbortError")
    }
    return "OpenRouter Error: " + (error as Error).message
  }

  if (signal.aborted) throw new DOMException("Aborted", "AbortError")

  const responseData = llmReponse.choices[0].message.content
  const info = await openProjectClient.createTaskFromLlmResponse(
    responseData,
    availableTasks,
    message.selectedProject,
  )
  return "Finished"
}

function buildLllmPrompt(
  message: StartProcessing & { extractedText: string },
  availableTasks: Task[],
  availableUsers: User[],
  userPrompt: string | null,
): string {
  let llmRequest = new LlmRequest()
    .setSystemPrompt(defaultSystemPrompt)
    .setPdfContent(message.extractedText)
    .setAvailableTasks(availableTasks)
    .setTypes(defaultTypes)

  if (availableUsers.length > 0) {
    llmRequest = llmRequest.addType(
      "User",
      `Available Values (use fill the field with the urls): ${JSON.stringify(availableUsers)}`,
    )
  }

  if (userPrompt) {
    llmRequest = llmRequest.setUserPrompt(userPrompt)
  }

  return llmRequest.build()
}

async function refreshAndGetTaskSchemas(project: Project): Promise<string | Task[]> {
  const validationOrSchemaUpdateResult = await validateAndRefreshTaskSchemas()
  if (validationOrSchemaUpdateResult) {
    return validationOrSchemaUpdateResult
  }

  const tasksToUpdate = await fetchUpdatedTaskDetails(project)
  return mergeTaskData(tasksToUpdate)
}

async function validateAndRefreshTaskSchemas(): Promise<string | null> {
  const referenceProject = await getValue<Project>(StorageKey.ReferenceProject)
  if (!referenceProject) {
    return "Bitte wähle zuerst ein Referenzprojekt aus."
  }

  const storedTasks = await getValue<Task[]>(StorageKey.OpenProjectTasks)
  if (!storedTasks || storedTasks.length === 0) {
    return "Bitte erstelle erst mindestens einen Task."
  }

  let changedTaskSchemaNames: string[] = []
  for (const task of storedTasks) {
    const { task: updatedTask, taskChanged } = await openProjectClient.updateTaskDetails(
      task,
      referenceProject.url,
    )

    if (taskChanged) {
      changedTaskSchemaNames.push(updatedTask.name)
    }

    const index = storedTasks.findIndex((t) => t.url === task.url)
    if (index !== -1) {
      storedTasks[index] = updatedTask
    }
  }

  await saveValue(StorageKey.OpenProjectTasks, storedTasks)
  if (changedTaskSchemaNames.length > 0) {
    return `Das Schema für einen oder mehrere Tasks hat sich geändert (${changedTaskSchemaNames.join(", ")}).
      Bitte überprüfe es in den Einstellungen und starte den Prozess erneut.`
  }

  return null
}

async function fetchUpdatedTaskDetails(project: Project): Promise<Task[]> {
  const storedTasks = await getValue<Task[]>(StorageKey.OpenProjectTasks)
  if (!storedTasks) {
    return []
  }

  const tasksToUpdate: Task[] = []
  for (const task of storedTasks) {
    const updatedTask = await openProjectClient.getTaskDetails(task.url, project.url)
    tasksToUpdate.push(updatedTask)
  }

  return tasksToUpdate
}

async function mergeTaskData(tasksToUpdate: Task[]): Promise<Task[]> {
  const storedTasks = (await getValue<Task[]>(StorageKey.OpenProjectTasks)) ?? []
  const finalTasks: Task[] = []

  for (const task of tasksToUpdate) {
    const storedTask = storedTasks.find((t: Task) => t.url === task.url)
    if (storedTask) {
      const commonAttributes: Record<string, any> = {}
      const commonKeys = Object.keys(storedTask.data).filter((key) => task.data.hasOwnProperty(key))

      for (const key of commonKeys) {
        commonAttributes[key] = storedTask.data[key]
      }

      finalTasks.push({
        ...task,
        data: commonAttributes,
      })
    }
  }

  return finalTasks
}
