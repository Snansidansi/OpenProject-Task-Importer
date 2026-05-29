<script lang="ts">
  let { selectedFile } = $props<{
    selectedFile: File | null
  }>()
</script>

<div class="mb-6 flex flex-col items-center">
  <div
    class="bg-secondary-container mb-4 flex h-20 w-20 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
  >
    {#if selectedFile}
      <span class="material-symbols-outlined text-primary text-[40px]">check_circle</span>
    {:else}
      <span class="material-symbols-outlined text-primary text-[40px]">upload_file</span>
    {/if}
  </div>

  <h3 class="font-headline-md text-headline-md text-on-surface mb-2">
    {selectedFile ? selectedFile.name : "Ziehe deine PDF hierher oder klicke um sie auszuwählen."}
  </h3>

  <p class="font-body-md text-body-md text-on-surface-variant max-w-70">
    {#if selectedFile}
      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - bereit zum Import
    {/if}
  </p>
</div>
