<script lang="ts">
  import type { Project } from "../../openProject/openProjectTypes"

  let {
    projects,
    disabled = false,
    selectedProject = $bindable(),
  } = $props<{
    projects: Project[]
    disabled?: boolean
    selectedProject: Project | null
  }>()
</script>

<div class="mb-stack-lg group w-full" id="project-container">
  <label class="font-label-md text-label-md text-primary mb-2 block" for="project-select"
    >Project:</label
  >
  <div class="relative">
    <select
      class="bg-surface-container-lowest border-outline-variant font-body-md text-body-md focus:ring-primary focus:border-primary w-full cursor-pointer appearance-none rounded-xl border px-4 py-4 pr-10 transition-all focus:ring-2"
      id="project-select"
      bind:value={selectedProject}
      disabled={disabled}
    >
      {#each projects as project}
        <option value={project}>{project.name}</option>
      {/each}
    </select>
    <div
      class="text-on-surface-variant pointer-events-none absolute inset-y-0 right-0 flex items-center px-4"
    >
      <span class="material-symbols-outlined">expand_more</span>
    </div>
  </div>
</div>
