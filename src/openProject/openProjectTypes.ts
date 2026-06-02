export type Project = {
  name: string
  url: string
}

export type TaskAttributeData = {
  allowedForLLM: boolean
  required: boolean
  llmNote: string
  type: string
}

export type Task = {
  name: string
  url: string
  data: Record<string, TaskAttributeData>
}

export type TaskMetadata = {
  name: string
  url: string
}
