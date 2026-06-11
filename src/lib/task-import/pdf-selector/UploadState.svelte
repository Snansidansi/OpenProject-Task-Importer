<script lang="ts">
  import { t } from "../../../i18n"

  let { selectedFile } = $props<{
    selectedFile: File | null
  }>()
</script>

<div class="flex w-full flex-col items-center">
  <div
    class="bg-secondary-container mb-3 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
  >
    {#if selectedFile}
      <span class="material-symbols-outlined text-primary text-[40px]">check_circle</span>
    {:else}
      <span class="material-symbols-outlined text-primary text-[40px]">upload_file</span>
    {/if}
  </div>

  <h3 class="font-headline-md text-headline-md text-on-surface w-full truncate px-4">
    {selectedFile ? selectedFile.name : t("uploadPlaceholder")}
  </h3>

  <p class="font-body-md text-body-md text-on-surface-variant max-w-70">
    {#if selectedFile}
      {(selectedFile.size / (1024 * 1024)).toFixed(2)} {t("fileReady")}
    {/if}
  </p>
</div>
