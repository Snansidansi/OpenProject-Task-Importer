<script lang="ts">
  import TextInput from "./TextInput.svelte"
  import PasswordInput from "./PasswordInput.svelte"
  import TextArea from "./TextArea.svelte"
  import Accordion from "./Accordion.svelte"
  import Footer from "./Footer.svelte"
  import { onMount } from "svelte"
  import { getValue, saveValue, StorageKey } from "../../storage"
  import TaskSettings from "./tasks/TaskSettings.svelte"
  import type { Task, TaskMetadata } from "../../openProject/openProjectTypes"
  import { showInfo } from "../../infoStore"
  import { openProjectClient } from "../../openProject/openProjectClient"

  let openProjectUrl = $state("")
  let openProjectApiKey = $state("")
  let openRouterApiKey = $state("")
  let aiModel = $state("")
  let aiPrompt = $state("")
  let isLoaded = $state(false)
  let tasks = $state<Task[]>([])
  let availableTasks = $state<TaskMetadata[]>([])

  onMount(async () => {
    openProjectUrl = (await getValue(StorageKey.OpenProjectUrl)) || ""
    openProjectApiKey = (await getValue(StorageKey.OpenProjectApiKey)) || ""
    openRouterApiKey = (await getValue(StorageKey.OpenRouterApiKey)) || ""
    aiModel = (await getValue(StorageKey.AiModel)) || ""
    aiPrompt = (await getValue(StorageKey.AiPrompt)) || ""
    // tasks = (await getValue<Task[]>(StorageKey.OpenProjectTasks)) || []
    tasks = [getExampleTask()]

    try {
      availableTasks = await openProjectClient.getTaskNames()
    } catch (error) {
      showInfo((error as Error).message)
    }

    isLoaded = true
  })

  $effect(() => {
    if (isLoaded) saveValue(StorageKey.OpenProjectUrl, openProjectUrl)
  })

  $effect(() => {
    if (isLoaded) saveValue(StorageKey.OpenProjectApiKey, openProjectApiKey)
  })

  $effect(() => {
    if (isLoaded) saveValue(StorageKey.OpenRouterApiKey, openRouterApiKey)
  })

  $effect(() => {
    if (isLoaded) saveValue(StorageKey.AiModel, aiModel)
  })

  $effect(() => {
    if (isLoaded) saveValue(StorageKey.AiPrompt, aiPrompt)
  })

  $effect(() => {
    if (!isLoaded) return
    const rawData = $state.snapshot(tasks)
    saveValue(StorageKey.OpenProjectTasks, rawData)
  })

  function getExampleTask(): Task {
    return {
      name: "Beispielaufgabe",
      data: {
        "Feld 1": { allowedForLLM: true, required: true },
        "Feld 2": { allowedForLLM: false, required: false },
      },
    }
  }

  function addTask(newTask: TaskMetadata) {
    if (tasks.find((task) => task.name === newTask.name)) return
    // fetch detailed task data and push
    // tasks.push(structuredClone($state.snapshot(newTask)))
  }

  function deleteTask(taskName: String) {
    tasks = tasks.filter((task) => task.name !== taskName)
  }
</script>

<div class="text-on-background flex w-full flex-col items-center">
  <div
    class="ambient-card flex w-full flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0px_20px_24px_-4px_rgba(0,0,0,0.04)]"
  >
    <TextInput
      label="OpenProject URL"
      id="op_url"
      placeholder="https://..."
      icon="link"
      bind:value={openProjectUrl}
    />

    <PasswordInput
      label="OpenProject Token"
      id="op_token"
      placeholder="Ihr API Zugriffsschlüssel"
      icon="key"
      bind:value={openProjectApiKey}
    />

    <PasswordInput
      label="OpenRouter API Key"
      id="or_key"
      placeholder="sk-or-v1-..."
      icon="key"
      bind:value={openRouterApiKey}
    />

    <TextInput label="KI Modell" id="ai_model" icon="smart_toy" bind:value={aiModel} />

    <Accordion title="Open Project Tasks" id="tasks">
      <TaskSettings
        availableTasks={availableTasks}
        onSelect={addTask}
        tasks={tasks}
        onDelete={deleteTask}
      />
    </Accordion>

    <Accordion title="Erweiterte Prompt-Einstellungen" id="prompt">
      <TextArea
        label="KI Prompt"
        id="ki_prompt"
        placeholder="System-Instruktionen hier eingeben..."
        rows={4}
        bind:value={aiPrompt}
      />
    </Accordion>
  </div>

  <Footer />
</div>
