export type Project = {
  name: string
  id: number
}

export type Task = {
  name: string
  data: Record<string, boolean>
}

export type TaskMetadata = {
  name: string
  id: number
}
