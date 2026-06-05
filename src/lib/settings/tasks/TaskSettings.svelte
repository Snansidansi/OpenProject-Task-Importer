<script lang="ts">
  import { t } from "../../../i18n"
  import type { Task, TaskMetadata, Project } from "../../../openProject/openProjectTypes"
  import NewTaskDropdown from "./NewTaskDropdown.svelte"
  import TaskListEntry from "./TaskListEntry.svelte"
  import ProjectSelection from "../../task-import/ProjectSelection.svelte"

  let {
    tasks,
    availableTasks,
    projects,
    referenceProject = $bindable(),
    onSelect,
    onDelete,
    disabled = false,
  } = $props<{
    tasks: Task[]
    availableTasks: TaskMetadata[]
    projects: Project[]
    referenceProject: Project | null
    onSelect: (task: TaskMetadata) => void
    onDelete: (taskUrl: String) => void
    disabled?: boolean
  }>()
</script>

<div class="mb-3">
  <ProjectSelection
    projects={projects}
    bind:selectedProject={referenceProject}
    label={t("referenceProjectLabel")}
    disabled={disabled}
  />
  {#if !referenceProject}
    <div class="text-error mt-1 flex items-center gap-1 text-sm">
      <span class="material-symbols-outlined text-sm text-red-600">info</span>
      <span class="text-red-600">{t("referenceProjectRequired")}</span>
    </div>
  {/if}
</div>

<NewTaskDropdown
  availableTasks={availableTasks}
  onSelect={onSelect}
  disabled={disabled || !referenceProject}
/>

{#each tasks.toSorted((a: Task, b: Task) => a.name.localeCompare(b.name)) as task}
  <TaskListEntry
    task={task}
    onDelete={() => {
      onDelete(task.url)
    }}
  />
{/each}
