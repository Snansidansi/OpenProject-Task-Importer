export type Project = {
  name: string
  id: number
}

export type TaskAttributeData = {
  allowedForLLM: boolean
  required: boolean
}

export type Task = {
  name: string
  data: Record<string, TaskAttributeData>
}

export type TaskMetadata = {
  name: string
  id: number
}
