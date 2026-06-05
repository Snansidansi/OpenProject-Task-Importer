<script lang="ts">
  import { t } from "../../../i18n"
  import type { Task, TaskMetadata } from "../../../openProject/openProjectTypes"

  let {
    availableTasks,
    onSelect,
    disabled = false,
  } = $props<{
    availableTasks: Task[]
    onSelect: (task: TaskMetadata) => void
    disabled?: boolean
  }>()

  let currentSelection = $state<TaskMetadata | null>(null)
  function handleChange() {
    if (currentSelection) {
      onSelect(currentSelection)
      currentSelection = null
    }
  }
</script>

<div class="relative min-w-50">
  <select
    class="bg-surface-container-lowest border-outline-variant font-body-md text-body-md focus:ring-primary focus:border-primary w-full cursor-pointer appearance-none rounded-xl border px-4 py-4 pr-10 transition-all focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
    bind:value={currentSelection}
    onchange={handleChange}
    disabled={disabled}
  >
    <option disabled hidden selected value={null}>{t("newTaskPlaceholder")}</option>
    {#each availableTasks as task}
      <option value={task}>{task.name}</option>
    {/each}
  </select>
  <div class="text-on-primary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
    <span class="material-symbols-outlined">expand_more</span>
  </div>
</div>
