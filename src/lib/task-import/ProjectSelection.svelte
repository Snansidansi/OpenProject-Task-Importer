<script lang="ts">
  import { t } from "../../i18n"
  import type { Project } from "../../openProject/openProjectTypes"

  let {
    projects,
    label = t("projectLabel"),
    disabled = false,
    selectedProject = $bindable(),
  } = $props<{
    projects: Project[]
    label?: string
    disabled?: boolean
    selectedProject: Project | null
  }>()

  let hasLoaded = $state(false)

  $effect(() => {
    if (projects.length > 0 && !hasLoaded) {
      hasLoaded = true
    }
  })
</script>

<div class="group w-full" id="project-container">
  <label class="font-label-md text-label-md text-primary mb-2 block" for="project-select"
    >{label}</label
  >
  <div class="relative">
    <select
      class="bg-surface-container-lowest border-outline-variant font-body-md text-body-md focus:ring-primary focus:border-primary w-full cursor-pointer appearance-none rounded-xl border px-4 py-4 pr-10 transition-all focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      id="project-select"
      bind:value={selectedProject}
      disabled={disabled || projects.length === 0}
    >
      {#if projects.length === 0}
        <option value="" disabled selected>{t("loadingProjects")}</option>
      {:else}
        <option value="" disabled={selectedProject !== null}>{t("projectPlaceholder")}</option>
        {#each projects as project}
          <option value={project} selected={selectedProject?.id === project.id}
            >{project.name}</option
          >
        {/each}
      {/if}
    </select>
    <div
      class="text-on-surface-variant pointer-events-none absolute inset-y-0 right-0 flex items-center px-4"
    >
      <span class="material-symbols-outlined">expand_more</span>
    </div>
  </div>
</div>
