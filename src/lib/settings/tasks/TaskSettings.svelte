<script lang="ts">
  import type { Task, TaskMetadata } from "../../../openProject/openProjectTypes"
  import NewTaskDropdown from "./NewTaskDropdown.svelte"
  import TaskListEntry from "./TaskListEntry.svelte"

  let { tasks, availableTasks, onSelect, onDelete } = $props<{
    tasks: Task[]
    availableTasks: TaskMetadata[]
    onSelect: (task: TaskMetadata) => void
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
