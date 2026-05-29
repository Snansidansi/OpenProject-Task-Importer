<script lang="ts">
  import ImportButton from "./ImportButton.svelte"
  import PdfSelector from "./pdf-selector/PdfSelector.svelte"
  import ProjectSelection from "./ProjectSelection.svelte"

  let projects = ["Projekt 1", "Projekt 2"]
  let isProcessing = false
  let selectedProject = projects[0]
  let selectedFile: File | null = null

  function handleButtonClick() {
    if (selectedFile == null) {
      return
    }
    isProcessing = !isProcessing
  }
</script>

<div class="text-on-surface flex min-h-screen flex-col">
  <!-- Welcome / Context -->
  <div class="mb-stack-lg w-full text-center md:text-left">
    <p class="font-body-md text-body-md text-on-surface-variant">
      Wähle ein Projekt aus und lade dein Dokument hoch, um Aufgaben automatisch zu extrahieren.
    </p>
  </div>

  <ProjectSelection projects={projects} disabled={isProcessing} selectedProject={selectedProject} />
  <PdfSelector isProcessing={isProcessing} bind:selectedFile={selectedFile} />
  <div class="h-7"></div>
  <ImportButton isProcessing={isProcessing} onclick={handleButtonClick} />
</div>
