<script lang="ts">
  import type { OpenProjectTask } from "../../../task"
  import NewTaskDropdown from "./NewTaskDropdown.svelte"
  import TaskListEntry from "./TaskListEntry.svelte"

  let { tasks, availableTasks, onSelect, onDelete } = $props<{
    tasks: OpenProjectTask[]
    availableTasks: OpenProjectTask[]
    onSelect: (task: OpenProjectTask) => void
    onDelete: (taskName: String) => void
  }>()
</script>

<NewTaskDropdown availableTasks={availableTasks} onSelect={onSelect} />
{#each tasks as task}
  <TaskListEntry
    task={task}
    onDelete={() => {
      onDelete(task.name)
    }}
  />
{/each}
