<script lang="ts">
  import type { StartProcessing, StopProcessing as StopProcessing } from "../../background"
  import { showInfo } from "../../infoStore"
  import type { Project } from "../../openProject/openProjectTypes"
  import { extractTextFromPdf } from "../../textExtractor"
  import ImportButton from "./ImportButton.svelte"
  import PdfSelector from "./pdf-selector/PdfSelector.svelte"
  import ProjectSelection from "./ProjectSelection.svelte"

  let { projects } = $props<{ projects: Project[] }>()

  let isProcessing = $state(false)
  let selectedProject: Project | null = $state(null)
  let selectedFile: File | null = $state(null)
  let projectsLoaded = $state(false)

  $effect(() => {
    if (projects.length > 0 && !projectsLoaded) {
      projectsLoaded = true
      if (selectedProject === null && projects.length > 0) {
        selectedProject = projects[0]
      }
    }
  })

  async function handleButtonClick() {
    if (!selectedProject) {
      showInfo("Bitte ein Projekt auswählen.")
      return
    }

    if (!selectedFile) {
      showInfo("Bitte eine Datei auswählen.")
      return
    }

    if (isProcessing) {
      isProcessing = false
      const message: StopProcessing = { type: "StopProcessing" }
      const info = await chrome.runtime.sendMessage(message)
      showInfo(info)
      return
    }

    isProcessing = true
    let extractedText: string
    try {
      extractedText = await extractTextFromPdf(selectedFile)
      showInfo(extractedText)
    } catch (error) {
      showInfo((error as Error).message)
      return
    }

    const message: StartProcessing = {
      type: "StartProcessing",
      extractedText: extractedText,
      selectedProject: selectedProject,
    }
    const info = await chrome.runtime.sendMessage(message)
    showInfo(info)

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

  <div class="mb-4">
    <ProjectSelection
      projects={projects}
      disabled={isProcessing}
      bind:selectedProject={selectedProject}
      label="Projekt"
    />
  </div>
  <PdfSelector isProcessing={isProcessing} bind:selectedFile={selectedFile} />
  <div class="h-7"></div>
  <ImportButton isProcessing={isProcessing} onclick={handleButtonClick} />
</div>
