<script lang="ts">
  import type { Task } from "../../../openProject/openProjectTypes"
  import NewTaskDropdown from "./NewTaskDropdown.svelte"
  import TaskListEntry from "./TaskListEntry.svelte"

  let { tasks, availableTasks, onSelect, onDelete } = $props<{
    tasks: Task[]
    availableTasks: Task[]
    onSelect: (task: Task) => void
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
