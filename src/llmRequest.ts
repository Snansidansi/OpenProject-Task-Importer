import type { TaskAttributeData } from "./openProject/openProjectTypes"

export class LlmRequest {
  private systemPrompt: string
  private userPrompt: string | undefined
  private types: Record<string, TaskAttributeData> | undefined
  private pdfContent: string
  private taskSchemas: Record<string, any> | undefined

  constructor() {
    this.systemPrompt = ""
    this.userPrompt = undefined
    this.types = {}
    this.pdfContent = ""
    this.taskSchemas = undefined
  }

  public setSystemPrompt(prompt: string): this {
    this.systemPrompt = prompt
    return this
  }

  public setUserPrompt(prompt: string): this {
    this.userPrompt = prompt
    return this
  }

  public addType(name: string, type: TaskAttributeData): this {
    if (!this.types) {
      this.types = {}
    }
    this.types[name] = type
    return this
  }

  public setTypes(types: Record<string, TaskAttributeData>): this {
    this.types = types
    return this
  }

  public addTaskSchema(name: string, taskSchema: any): this {
    if (!this.taskSchemas) {
      this.taskSchemas = {}
    }
    this.taskSchemas[name] = taskSchema
    return this
  }

  public setTaskTypes(taskTypes: Record<string, any>): this {
    this.taskSchemas = taskTypes
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

    if (this.taskSchemas && Object.keys(this.taskSchemas).length > 0) {
      const taskTypesJson = JSON.stringify(this.taskSchemas, null, 2)
      parts.push(`Task Types:\n${taskTypesJson}`)
    }

    if (this.pdfContent) {
      parts.push(`PDF Content:\n${this.pdfContent}`)
    }

    return parts.join("\n\n")
  }
}

export const systemPrompt =
  "You are an project management assistant that has the job to extract task form a given PDF content (at the end of the prompt)." +
  "You are given one or more json task schemas in this prompt which are your options." +
  "Its your job to choose a task type." +
  "Each file name in the task type json schema include a type which you need to look up in the types section of this prompt for more information." +
  "If a type is not specified ignore that field." +
  "You need to fill every other field." +
  "There also can be description for a field in the schema that you should respect when filling out that field in your response" +
  '(E.g. {"taskname": {"type": "string", "description\:"max 255 chars"}} means that there is a field named taskname which is a string with a maximum length of 255 characters).' +
  "Some descriptions and other text may be in a different language then english which you should adopt to" +
  "You absolutely need to responde in the following json format:" +
  "Answer in one json object with one key for every type of tasks that youve used." +
  "Each of these fields will contain a list of all of the tasks where you then use the specified json format as discussed." +
  "Only reply with the json data ans nothing else." +
  "No introduction or smalltalk!" +
  "If you want to make one task a subtask of another task (or the user wants so) nest them in the specified child field." +
  "One task can have zero or more subtasks but a task can not ever have two parents!"
