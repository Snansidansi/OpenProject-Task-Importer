export type BackgroundOperationMessage = StartProcessing | StopProcessign

export interface StartProcessing {
  type: "StartProcessing"
}

export interface StopProcessign {
  type: "StopProcessing"
}

chrome.runtime.onMessage.addListener((message: BackgroundOperationMessage, _, sendResponse) => {
  switch (message.type) {
    case "StartProcessing":
      return true

    case "StopProcessing":
      sendResponse("Stopped")
      break
  }
})
