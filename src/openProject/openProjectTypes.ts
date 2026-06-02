export type Project = {
  name: string
  url: string
}

export type TaskAttributeData = {
  allowedForLLM: boolean
  required: boolean
  llmNote: string
}

export type Task = {
  name: string
  data: Record<string, TaskAttributeData>
}

export type TaskMetadata = {
  name: string
  id: number
}
