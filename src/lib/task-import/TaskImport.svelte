<script lang="ts">
  import { onMount } from "svelte"
  import type { StartProcessing, StopProcessing } from "../../background"
  import { showInfo } from "../../infoStore"
  import type { Project } from "../../openProject/openProjectTypes"
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

  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

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
      const message: StopProcessing = { type: "StopProcessing" }
      chrome.runtime.sendMessage(message)
      isProcessing = false
      return
    }

    isProcessing = true
    let fileData: ArrayBuffer
    try {
      fileData = await selectedFile.arrayBuffer()
    } catch (error) {
      showInfo((error as Error).message)
      isProcessing = false
      return
    }
    const base64Data = arrayBufferToBase64(fileData)

    const startMessage: StartProcessing = {
      type: "StartProcessing",
      fileData: base64Data,
      selectedProject: selectedProject,
    }
    const info = await chrome.runtime.sendMessage(startMessage)
    if (info !== "") {
      showInfo(info)
    }

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
