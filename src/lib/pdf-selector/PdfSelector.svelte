<script lang="ts">
  import LoadingState from "./LoadingState.svelte"
  import UploadState from "./UploadState.svelte"

  export let isProcessing: boolean = false
  export let selectedFile: File | null = null

  let isDragActive: boolean = false
  let fileInput: HTMLInputElement

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
  class="bg-surface-container-lowest border-outline-variant p-stack-lg hover:border-primary/50 group relative flex min-h-80 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed text-center shadow-[0px_20px_24px_-4px_rgba(0,0,0,0.02)] transition-all duration-300"
  class:border-[#3d6845]={isDragActive || (selectedFile && !isProcessing)}
  class:bg-[#f1f7f2]={isDragActive || (selectedFile && !isProcessing)}
  class:pointer-events-none={isProcessing}
  on:click={() => {
    if (!isProcessing) fileInput.click()
  }}
  on:dragover|preventDefault={() => {
    if (!isProcessing) isDragActive = true
  }}
  on:dragleave={() => (isDragActive = false)}
  on:drop|preventDefault={onDrop}
>
  <div
    class="bg-primary/0 group-hover:bg-primary/2 pointer-events-none absolute inset-0 transition-colors"
  ></div>

  {#if isProcessing}
    <LoadingState />
  {:else}
    <UploadState selectedFile={selectedFile} />
  {/if}

  <input type="file" accept=".pdf" class="hidden" bind:this={fileInput} on:change={onFileChange} />
</div>
