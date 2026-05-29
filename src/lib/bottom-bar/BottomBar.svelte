<script lang="ts">
  import NavButton from "./NavButton.svelte"

  let { showImport = $bindable(true) } = $props<{
    showImport?: boolean
  }>()
</script>

<nav
  class="bg-surface-container-lowest border-outline-variant flex items-center justify-around border-t px-4 py-2"
>
  <NavButton
    icon="upload_file"
    text="Import"
    active={showImport}
    onclick={() => (showImport = true)}
  />

  <NavButton
    icon="tune"
    text="Settings"
    active={!showImport}
    onclick={() => (showImport = false)}
  />
</nav>
