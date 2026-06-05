<script lang="ts">
  import { t } from "../i18n"

  let { showImport } = $props<{
    showImport: Boolean
  }>()
</script>

<header class="bg-surface sticky top-0 z-50 w-full shadow-[0px_20px_24px_-4px_rgba(0,0,0,0.04)]">
  <div
    class="px-margin-mobile max-w-container-max mx-auto flex w-full items-center justify-between py-4"
  >
    <h1 class="font-headline-md text-headline-md text-primary font-bold">
      {#if showImport}
        {t("importPageTitle")}
      {:else}
        {t("settingsPageTitle")}
      {/if}
    </h1>
  </div>
</header>
