<script lang="ts">
  import type { StartProcessing, StopProcessign as StopProcessing } from "../../background"
  import { showInfo } from "../../infoStore"
  import { extractTextFromPdf } from "../../textExtractor"
  import ImportButton from "./ImportButton.svelte"
  import PdfSelector from "./pdf-selector/PdfSelector.svelte"
  import ProjectSelection from "./ProjectSelection.svelte"

  let projects = ["Projekt 1", "Projekt 2"]
  let isProcessing = false
  let selectedProject = projects[0]
  let selectedFile: File | null = null

  async function handleButtonClick() {
    if (selectedFile == null) {
      return
    }

    if (isProcessing) {
      isProcessing = false
      const message: StopProcessing = { type: "StopProcessing" }
      const info = await chrome.runtime.sendMessage(message)
      return
    }

    isProcessing = true

    try {
      const extractedText = await extractTextFromPdf(selectedFile)
      showInfo(extractedText)
    } catch (error) {
      showInfo((error as Error).message)
    }

    // const message: StartProcessing = {
    //   type: "StartProcessing",
    // }
    // const info = await chrome.runtime.sendMessage(message)
    // showInfo(info)

    isProcessing = false
    selectedFile = null
  }
</script>

<div class="text-on-surface flex flex-col">
  <!-- Welcome / Context -->
  <div class="mb-stack-md w-full text-center">
    <p class="font-body-md text-body-md text-on-surface-variant">
      Wähle ein Projekt aus und lade dein Dokument hoch, um Aufgaben automatisch zu extrahieren.
    </p>
  </div>

  <ProjectSelection projects={projects} disabled={isProcessing} selectedProject={selectedProject} />
  <PdfSelector isProcessing={isProcessing} bind:selectedFile={selectedFile} />
  <div class="h-7"></div>
  <ImportButton isProcessing={isProcessing} onclick={handleButtonClick} />
</div>
