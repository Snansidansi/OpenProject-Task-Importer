<script lang="ts">
  import BottomBar from './lib/BottomBar.svelte'
  import TaskImport from './lib/TaskImport.svelte'
  import TopBar from './lib/TopBar.svelte'

  let showImport = true
</script>

<TopBar showImport={showImport} />

<main class="px-margin-mobile py-stack-lg mx-auto flex w-full max-w-2xl grow flex-col items-center">
  {#if showImport}
    <TaskImport />
  {:else}
    <p>Einstellungen kommen bald</p>
  {/if}
</main>

<BottomBar bind:showImport={showImport} />
