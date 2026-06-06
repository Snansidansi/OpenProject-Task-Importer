<script lang="ts">
  import { t } from "../../i18n"
  import TextInput from "./TextInput.svelte"
  import PasswordInput from "./PasswordInput.svelte"
  import TextArea from "./TextArea.svelte"
  import Accordion from "./Accordion.svelte"
  import Footer from "./Footer.svelte"
  import { onMount } from "svelte"
  import { getValue, saveValue, StorageKey, exportSettings, importSettings } from "../../storage"
  import TaskSettings from "./tasks/TaskSettings.svelte"
  import type { Task, TaskMetadata, Project } from "../../openProject/openProjectTypes"
  import { showInfo } from "../../infoStore"
  import { openProjectClient } from "../../openProject/openProjectClient"
  import ProjectSelection from "../task-import/ProjectSelection.svelte"

  let { projects } = $props<{ projects: Project[] }>()

  let openProjectUrl = $state("")
  let openProjectApiKey = $state("")
  let openRouterApiKey = $state("")
  let aiModel = $state("")
  let aiPrompt = $state("")
  let isLoaded = $state(false)
  let tasks = $state<Task[]>([])
  let availableTasks = $state<TaskMetadata[]>([])
  let referenceProject = $state<Project | null>(null)

  onMount(async () => {
    openProjectUrl = (await getValue(StorageKey.OpenProjectUrl)) || ""
    openProjectApiKey = (await getValue(StorageKey.OpenProjectApiKey)) || ""
    openRouterApiKey = (await getValue(StorageKey.OpenRouterApiKey)) || ""
    aiModel = (await getValue(StorageKey.AiModel)) || ""
    aiPrompt = (await getValue(StorageKey.AiPrompt)) || ""
    tasks = (await getValue<Task[]>(StorageKey.OpenProjectTasks)) || []

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

  // Load reference project from storage on mount
  $effect(() => {
    if ((projects as Project[]).length != 0 && !referenceProject) {
      getValue(StorageKey.ReferenceProject).then((savedProject: any) => {
        if (savedProject && savedProject.url) {
          referenceProject =
            projects.find((project: Project) => project.url === savedProject.url) || null
        }
      })
    }
  })

  // Automatically save reference project when it changes
  $effect(() => {
    if ((projects as Project[]).length != 0 && referenceProject)
      saveValue(StorageKey.ReferenceProject, $state.snapshot(referenceProject))
  })

  // Check if the selected project still exists
  $effect(() => {
    if (!isLoaded || projects.length === 0) return
    if (referenceProject) {
      const exists = (projects as Project[]).some((p: Project) => p.url === referenceProject?.url)
      if (!exists) {
        referenceProject = null
      }
    }
  })

  // Fallback: Reset state if no projects are available
  $effect(() => {
    if (isLoaded && projects.length === 0 && referenceProject !== null) {
      referenceProject = null
    }
  })

  async function addTask(newTask: TaskMetadata) {
    if (!referenceProject) return

    const existingTask = tasks.find((task) => task.url === newTask.url)
    if (existingTask) {
      const updatedTask = await openProjectClient.updateTaskDetails(
        existingTask,
        referenceProject.url,
      )

      if (updatedTask.taskChanged) {
        showInfo(`${t("taskUpdated")}${existingTask.name}`)
      }

      deleteTask(newTask.url)
      tasks.push(updatedTask.task)
      return
    }
    try {
      const task = await openProjectClient.getTaskDetails(newTask.url, referenceProject.url)
      tasks.push(task)
    } catch (error) {
      showInfo((error as Error).message)
    }
  }

  function deleteTask(taskUrl: String) {
    tasks = tasks.filter((task) => task.url !== taskUrl)
  }

  async function handleImportClick() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        try {
          await importSettings(file)
          window.close()
        } catch (error) {
          console.error((error as Error).message)
          showInfo(t("settingsImportError"))
        }
      }
    }
    input.click()
  }
</script>

<div class="text-on-background flex w-full flex-col items-center">
  <div
    class="ambient-card flex w-full flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0px_20px_24px_-4px_rgba(0,0,0,0.04)]"
  >
    <TextInput
      label={t("openProjectUrlLabel")}
      id="op_url"
      placeholder="https://..."
      icon="link"
      bind:value={openProjectUrl}
    />

    <PasswordInput
      label={t("openProjectTokenLabel")}
      id="op_token"
      placeholder="Your API access key"
      icon="key"
      bind:value={openProjectApiKey}
    />

    <PasswordInput
      label={t("openRouterApiKeyLabel")}
      id="or_key"
      placeholder="sk-or-v1-..."
      icon="key"
      bind:value={openRouterApiKey}
    />

    <TextInput label={t("aiModelLabel")} id="ai_model" icon="smart_toy" bind:value={aiModel} />

    <Accordion title={t("openProjectTasksSection")} id="tasks">
      <TaskSettings
        availableTasks={availableTasks}
        projects={projects}
        bind:referenceProject={referenceProject}
        onSelect={addTask}
        tasks={tasks}
        onDelete={deleteTask}
      />
    </Accordion>

    <Accordion title={t("advancedPromptSettingsSection")} id="prompt">
      <TextArea
        label={t("aiPromptLabel")}
        id="ki_prompt"
        placeholder="Enter system instructions here..."
        bind:value={aiPrompt}
      />
    </Accordion>

    <div class="flex flex-col gap-2">
      <button
        onclick={exportSettings}
        class="hover:bg-primary/90 bg-primary w-full rounded-lg px-4 py-2 text-white"
      >
        {t("exportSettings")}
      </button>
      <button
        onclick={handleImportClick}
        class="w-full rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
      >
        {t("importSettings")}
      </button>
    </div>
  </div>

  <Footer />
</div>
