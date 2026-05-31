<script lang="ts">
  import type { OpenProjectTask } from "../../../openProject/task"

  let { task, onDelete } = $props<{
    task: OpenProjectTask
    onDelete: () => void
  }>()

  let expanded = $state(false)
  function onTaskClick() {
    expanded = !expanded
  }
</script>

<div
  class="task-card bg-surface-container-lowest group overflow-hidden rounded-xl transition-all duration-300"
  class:expanded={expanded}
  id="task-1"
>
  <button
    class="p-stack-md hover:bg-surface-container-low flex w-full items-center justify-between transition-colors duration-200"
    onclick={onTaskClick}
  >
    <div class="gap-stack-md flex items-center">
      <div class="text-left">
        <span class="font-label-md text-label-md text-on-surface">{task.name}</span>
        <div class="mt-1 flex gap-2"></div>
      </div>
    </div>
    <span
      class="material-symbols-outlined text-outline transform transition-transform duration-300 group-[.expanded]:rotate-180"
      >expand_more</span
    >
  </button>
  <div class="expandable-content">
    <div class="overflow-hidden">
      {#each Object.entries(task.data) as [key, value]}
        <label for="task-{task.name}-{key}">
          <div
            class="px-stack-md pb-stack-md border-outline-variant/20 pt-stack-sm space-y-2 border-t"
          >
            <div
              class="gap-stack-md hover:bg-surface-variant/30 flex items-center rounded-lg p-3 transition-colors"
            >
              <input
                bind:checked={task.data[key]}
                class="border-outline-variant text-primary focus:ring-primary h-5 w-5 rounded"
                type="checkbox"
                id="task-{task.name}-{key}"
              />
              <span class="font-body-md text-on-surface-variant">{key}</span>
            </div>
          </div>
        </label>
      {/each}
      <div class="px-stack-md pb-stack-md border-outline-variant/20 pt-stack-sm space-y-2 border-t">
        <button
          class="gap-stack-md flex w-full items-center justify-center rounded-lg bg-red-500 p-3 hover:bg-red-400"
          onclick={onDelete}
        >
          <span class="text-md text-white">Task Löschen</span>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .expandable-content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .expanded .expandable-content {
    grid-template-rows: 1fr;
  }
  .task-card {
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.04),
      0 8px 10px -6px rgba(0, 0, 0, 0.04);
  }
</style>
