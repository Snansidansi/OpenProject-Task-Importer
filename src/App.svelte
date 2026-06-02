<script lang="ts">
  import BottomBar from "./lib/bottom-bar/BottomBar.svelte"
  import InfoPopup from "./lib/infoPopup.svelte"
  import Settings from "./lib/settings/Settings.svelte"
  import TaskImport from "./lib/task-import/TaskImport.svelte"
  import TopBar from "./lib/TopBar.svelte"
  import { onMount } from "svelte"
  import type { Project } from "./openProject/openProjectTypes"
  import { openProjectClient } from "./openProject/openProjectClient"
  import { showInfo } from "./infoStore"

  let showImport = $state(true)
  let projects = $state<Project[]>([])

  onMount(async () => {
    try {
      const unsorted = await openProjectClient.getProjects()
      projects = unsorted.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      showInfo((error as Error).message)
    }
  })
</script>

<div class="flex max-h-150 w-full flex-col overflow-hidden">
  <TopBar showImport={showImport} />

  <main
    class="px-margin-mobile py-stack-md mx-auto flex w-full max-w-2xl grow flex-col items-center overflow-y-auto"
  >
    <InfoPopup />
    {#if showImport}
      <TaskImport {projects} />
    {:else}
      <Settings {projects} />
    {/if}
  </main>

  <BottomBar bind:showImport={showImport} />
</div>
