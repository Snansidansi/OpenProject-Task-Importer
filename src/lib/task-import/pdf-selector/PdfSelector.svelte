<script lang="ts">
  import LoadingState from "./LoadingState.svelte"
  import UploadState from "./UploadState.svelte"

  let { isProcessing = false, selectedFile = $bindable() } = $props<{
    isProcessing?: boolean
    selectedFile: File | null
  }>()

  let isDragActive = $state(false)
  let fileInput: HTMLInputElement

  let dynamicClasses = $derived(
    isDragActive || (selectedFile && !isProcessing)
      ? "border-[#3d6845] bg-[#f1f7f2]"
      : "border-outline-variant bg-surface-container-lowest",
  )

  function handleFile(file: File) {
    if (file && file.type === "application/pdf") {
      selectedFile = file
    } else {
      alert("Bitte laden Sie eine PDF-Datei hoch.")
    }
  }

  function onFileChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      handleFile(target.files[0])
    }
  }

  function onDrop(e: DragEvent) {
    isDragActive = false
    if (isProcessing) return
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="p-stack-md hover:border-primary/50 group relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed text-center shadow-[0px_20px_24px_-4px_rgba(0,0,0,0.02)] transition-all duration-300 {dynamicClasses}"
  class:pointer-events-none={isProcessing}
  onclick={() => {
    if (!isProcessing) fileInput.click()
  }}
  ondragover={(e) => {
    e.preventDefault()
    if (!isProcessing) isDragActive = true
  }}
  ondragleave={() => (isDragActive = false)}
  ondrop={(e) => {
    e.preventDefault()
    onDrop(e)
  }}
>
  {#if isProcessing}
    <LoadingState />
  {:else}
    <UploadState selectedFile={selectedFile} />
  {/if}

  <input type="file" accept=".pdf" class="hidden" bind:this={fileInput} onchange={onFileChange} />
</div>
