import type { Project, Task } from "./openProject/openProjectTypes"
import { openProjectClient } from "./openProject/openProjectClient"
import { getValue, saveValue, StorageKey } from "./storage"

export type BackgroundOperationMessage = StartProcessing | StopProcessing

export type StartProcessing = {
  type: "StartProcessing"
  extractedText: string
  selectedProject: Project
}

export type StopProcessing = {
  type: "StopProcessing"
}

chrome.runtime.onMessage.addListener((message: BackgroundOperationMessage, _, sendResponse) => {
  switch (message.type) {
    case "StartProcessing":
      return startProcessing(message)

    case "StopProcessing":
      sendResponse("Stopped")
      break
  }
})

async function startProcessing(message: StartProcessing): Promise<string> {
  const errorMessage = await refreshAndGetTaskSchemas(message.selectedProject)
  if (errorMessage) {
    return errorMessage
  }

  return message.extractedText
}

async function refreshAndGetTaskSchemas(project: Project): Promise<string | null> {
  const validationOrSchemaUpdateResult = await validateAndRefreshTaskSchemas()
  if (validationOrSchemaUpdateResult) {
    return validationOrSchemaUpdateResult
  }

  const tasksToUpdate = await fetchUpdatedTaskDetails(project)
  const finalTasks = mergeTaskData(tasksToUpdate)
  return null
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
      const index = storedTasks.findIndex((t) => t.url === task.url)
      if (index !== -1) {
        storedTasks[index] = updatedTask
      }
    }
  }

  if (changedTaskSchemaNames.length > 0) {
    await saveValue(StorageKey.OpenProjectTasks, storedTasks)
    return `Das schema für einen oder mehrere Tasks hat sich geändert (${changedTaskSchemaNames.join(", ")}).
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
