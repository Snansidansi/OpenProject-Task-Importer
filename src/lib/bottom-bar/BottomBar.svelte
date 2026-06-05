<script lang="ts">
  import { t } from "../../i18n"
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
    text={t("importButton")}
    active={showImport}
    onclick={() => (showImport = true)}
  />

  <NavButton
    icon="tune"
    text={t("settingsButton")}
    active={!showImport}
    onclick={() => (showImport = false)}
  />
</nav>
