import type { Task, TaskAttributeData } from "./openProject/openProjectTypes"

export class LlmRequest {
  private systemPrompt: string
  private userPrompt: string | undefined
  private types: Record<string, string> | undefined
  private pdfContent: string
  private availableTasks: Task[] | undefined

  constructor() {
    this.systemPrompt = ""
    this.userPrompt = undefined
    this.types = {}
    this.pdfContent = ""
    this.availableTasks = undefined
  }

  public setSystemPrompt(prompt: string): this {
    this.systemPrompt = prompt
    return this
  }

  public setUserPrompt(prompt: string): this {
    this.userPrompt = prompt
    return this
  }

  public addType(name: string, info: string): this {
    if (!this.types) {
      this.types = {}
    }
    this.types[name] = info
    return this
  }

  public setTypes(types: Record<string, string>): this {
    this.types = types
    return this
  }

  public addAvailableTask(taskSchema: Task): this {
    if (!this.availableTasks) {
      this.availableTasks = []
    }
    this.availableTasks.push(taskSchema)
    return this
  }

  public setAvailableTasks(taskSchemas: Task[]): this {
    this.availableTasks = taskSchemas
    return this
  }

  public setPdfContent(content: string): this {
    this.pdfContent = content
    return this
  }

  public build(): string {
    const parts: string[] = []

    if (this.systemPrompt) {
      parts.push(`System:\n${this.systemPrompt}`)
    }

    if (this.userPrompt) {
      parts.push(
        `Following are some specific orders from the user. Fullfill them as good as you can:\n${this.userPrompt}`,
      )
    }

    if (this.types && Object.keys(this.types).length > 0) {
      const typesJson = JSON.stringify(this.types, null, 2)
      parts.push(`Available Task Types:\n${typesJson}`)
    }

    if (this.availableTasks && Object.keys(this.availableTasks).length > 0) {
      const taskTypesJson = this.transformTasksToJson(this.availableTasks)
      parts.push(`Task Types:\n${taskTypesJson}`)
    }

    if (this.pdfContent) {
      parts.push(`PDF Content:\n${this.pdfContent}`)
    }

    return parts.join("\n\n")
  }

  private transformTasksToJson(originalTasks: Task[]): string {
    const tasksCopy = structuredClone(originalTasks) as Task[]

    const flattenedTasks = tasksCopy.map((item) => {
      delete (item as any).url

      const flattenedItem: any = {
        name: item.name,
        child: {
          llmNote: "nest subtasks here",
          required: false,
        },
      }

      if (item.data) {
        for (const [key, field] of Object.entries(item.data)) {
          if (!field.allowedForLLM) {
            continue
          }

          delete (field as any).allowedForLLM
          delete (field as any).location

          if (field.values && Array.isArray(field.values)) {
            field.values.forEach((val: any) => {
              delete val.type
            })
          }

          flattenedItem[key] = field
        }
      }

      return flattenedItem
    })

    return JSON.stringify(flattenedTasks, null, 2)
  }
}

export const defaultSystemPrompt =
  "You are an project management assistant that has the job to extract task form a given PDF content (at the end of the prompt)." +
  "You are given one or more json task schemas in this prompt which are your options." +
  "Its your job to choose a task type." +
  "In the task schemas include a type for each filed which you need to look up (if its not a basic type like string or boolean) in the types section of this prompt for more information." +
  "If a not basic type is not specified ignore that field." +
  "Even ignore the field if the user explicitly asks for it and you do not know the type so NEVER fill out a field without knowing how the type works." +
  "You need to fill out every field that has true for the required field and for the not required fields its your choice if you fill them out." +
  'There also can be description for a field in the schema that you should respect when filling out that field in your response and a name field so you know what the field means (important for fields like "customType12") ' +
  '(E.g. {"taskname": {"type": "string", "description\:"max 255 chars", "name": "Work package name"}} means that there is a field represents the work package name and is named "taskname" which is a string with a maximum length of 255 characters).' +
  'So the name field is just for your information dont write e.g. "Work package namw": {...} in your response but "taskname": {...} instead.' +
  "Some descriptions and other text may be in a different language then english which you should adopt to." +
  "You absolutely need to responde in the following json format otherwise you failed your job:" +
  "Answer in one json object which is a list of all the task objects." +
  "Each task object you put into this list must follow the schema for this task like discussed above with two differences:" +
  'Each Task object also absolutely needs to contain a field "taskType" which is the name of the name of the task specified in the "name" field of the schema for this task' +
  'If you want to make one task a subtask of another task (or the user wants so) nest them in the specified "children" field. (its important that you name it "children"' +
  'So in the nested "children" filed are full tasks like discussed above.' +
  'If you don not want to create a subtask for a task just omit the "children" filed' +
  "One task can have zero or more subtasks but a task can not ever have two parents!" +
  "Only reply with the json data and nothing else." +
  "No introduction or smalltalk just the [{...}, {...}, ...] object." +
  "If you cannot create sensible task from the provided pdf data then DONT create any." +
  "NEVER make any task up that are not sensible!"

export const defaultTypes: Record<string, string> = {
  Date: "Date in the format: YYYY-MM-DD",
  Duration:
    'ISO 8601 duration format (if a task schema contains the field "duration" of type duration it needs the duration in days (not hours)',
  Formattable: "A normal string in markdown format",
}
