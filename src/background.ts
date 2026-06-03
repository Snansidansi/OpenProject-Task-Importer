import { openProjectClient } from "./openProject/openProjectClient"
import { showInfo } from "./infoStore"
import { getValue, StorageKey } from "./storage"
import type { Task } from "./openProject/openProjectTypes"

export type BackgroundOperationMessage = StartProcessing | StopProcessing

export type StartProcessing = {
  type: "StartProcessing"
  extractedText: string
}

export type StopProcessing = {
  type: "StopProcessing"
}

chrome.runtime.onMessage.addListener((message: BackgroundOperationMessage, _, sendResponse) => {
  switch (message.type) {
    case "StartProcessing":
      startProcessing(message.extractedText)
      return "Fertig!"

    case "StopProcessing":
      sendResponse("Stopped")
      break
  }
})

async function startProcessing(extractedText: string) {}
