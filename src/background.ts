import { extractTextFromPdf } from "./textExtractor"

export enum BackgroundActions {
  StartProcessing,
}

interface ProcessingMessage {
  action: BackgroundActions
  arrayBuffer: any
}

chrome.runtime.onMessage.addListener((message: ProcessingMessage, sender, sendResponse) => {
  if (message.action === BackgroundActions.StartProcessing) {
    extractTextFromPdf(message.arrayBuffer)
  }
})
