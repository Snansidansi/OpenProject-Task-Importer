<script lang="ts">
  import BottomBar from "./lib/bottom-bar/BottomBar.svelte"
  import Settings from "./lib/settings/Settings.svelte"
  import TaskImport from "./lib/task-import/TaskImport.svelte"
  import TopBar from "./lib/TopBar.svelte"

  let showImport = true
</script>

<div class="flex max-h-150 w-full flex-col overflow-hidden">
  <TopBar showImport={showImport} />

  <main
    class="px-margin-mobile py-stack-md mx-auto flex w-full max-w-2xl grow flex-col items-center overflow-y-auto"
  >
    {#if showImport}
      <TaskImport />
    {:else}
      <Settings />
    {/if}
  </main>

  <BottomBar bind:showImport={showImport} />
</div>
