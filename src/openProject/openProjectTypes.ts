export type Project = {
  name: string
  url: string
}

export type AttributeValues = {
  name: string
  value: string
  type: "link" | "value"
}

export type TaskAttributeData = {
  allowedForLLM: boolean
  required: boolean
  llmNote: string
  type: string
  values?: AttributeValues[]
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
