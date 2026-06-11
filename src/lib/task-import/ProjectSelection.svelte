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

  let searchQuery = $state("")
  let isOpen = $state(false)
  let dropdownRef = $state<HTMLElement | null>(null)
  let highlightedIndex = $state(-1)

  let filteredProjects = $derived(
    projects.filter((project: Project) => {
      if (!searchQuery) return true
      const queryWords = searchQuery.toLowerCase().trim().split(/\s+/)
      const projectName = project.name.toLowerCase()
      return queryWords.every((word) => projectName.includes(word))
    }),
  )

  function selectProject(project: Project) {
    selectedProject = project
    searchQuery = project.name
    isOpen = false
    highlightedIndex = -1
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement
    searchQuery = target.value
    isOpen = true
    highlightedIndex = -1
  }

  function handleFocus() {
    if (!disabled && projects.length > 0) {
      isOpen = true
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled || projects.length === 0) return

    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      isOpen = true
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (filteredProjects.length > 0) {
        highlightedIndex = (highlightedIndex + 1) % filteredProjects.length
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (filteredProjects.length > 0) {
        highlightedIndex =
          (highlightedIndex - 1 + filteredProjects.length) % filteredProjects.length
      }
    } else if (e.key === "Enter") {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredProjects.length) {
        e.preventDefault()
        selectProject(filteredProjects[highlightedIndex])
      }
    } else if (e.key === "Escape") {
      isOpen = false
      if (selectedProject) {
        searchQuery = selectedProject.name
      }
    }
  }

  // Handle click outside to close dropdown
  $effect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
        if (isOpen) {
          isOpen = false
          // Reset searchQuery to selected name if it was changed but not selected
          if (selectedProject) {
            searchQuery = selectedProject.name
          } else {
            searchQuery = ""
          }
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  })
</script>

<div class="group w-full" id="project-container" bind:this={dropdownRef}>
  <label class="font-label-md text-label-md text-primary mb-2 block" for="project-search">
    {label}
  </label>
  <div class="relative">
    <input
      type="text"
      class="bg-surface-container-lowest border-outline-variant font-body-md text-body-md focus:ring-primary focus:border-primary w-full cursor-pointer rounded-xl border px-4 py-4 pr-10 transition-all focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      id="project-search"
      placeholder={projects.length === 0 ? t("loadingProjects") : t("projectPlaceholder")}
      bind:value={searchQuery}
      onfocus={handleFocus}
      oninput={handleInput}
      onkeydown={handleKeydown}
      disabled={disabled || projects.length === 0}
      autocomplete="off"
    />
    <div
      class="text-on-surface-variant pointer-events-none absolute inset-y-0 right-0 flex items-center px-4"
    >
      <span class="material-symbols-outlined">{isOpen ? "expand_less" : "expand_more"}</span>
    </div>

    {#if isOpen && projects.length > 0}
      <div
        class="bg-surface-container-lowest border-outline-variant absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border shadow-lg"
      >
        {#if filteredProjects.length === 0}
          <div class="text-on-surface-variant px-4 py-3 text-sm italic">
            {t("noProjectsFound")}
          </div>
        {:else}
          {#each filteredProjects as project, i}
            <button
              type="button"
              class="w-full px-4 py-3 text-left transition-colors {selectedProject?.id ===
              project.id
                ? 'font-bold'
                : ''} {highlightedIndex === i
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface hover:bg-surface-container-low'}"
              onclick={() => selectProject(project)}
              onmouseenter={() => (highlightedIndex = i)}
            >
              {project.name}
            </button>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</div>
