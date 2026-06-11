<script lang="ts">
  import type { StartProcessing } from "../../background"
  import { showInfo } from "../../infoStore"
  import type { Project } from "../../openProject/openProjectTypes"
  import ImportButton from "./ImportButton.svelte"
  import PdfSelector from "./pdf-selector/PdfSelector.svelte"
  import ProjectSelection from "./ProjectSelection.svelte"
  import { t } from "../../i18n"

  let { projects } = $props<{ projects: Project[] }>()

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
      showInfo(t("selectProjectError"))
      return
    }

    if (!selectedFile) {
      showInfo(t("selectFileError2"))
      return
    }

    let fileData: ArrayBuffer
    try {
      fileData = await selectedFile.arrayBuffer()
    } catch (error) {
      showInfo((error as Error).message)
      return
    }
    const base64Data = arrayBufferToBase64(fileData)

    const startMessage: StartProcessing = {
      type: "StartProcessing",
      fileData: base64Data,
      selectedProject: selectedProject,
    }
    selectedFile = null
    const info = await chrome.runtime.sendMessage(startMessage)
    if (info !== "") {
      showInfo(info)
    }
  }
</script>

<div class="text-on-surface flex flex-col">
  <!-- Welcome / Context -->
  <div class="mb-stack-md w-full text-center">
    <p class="font-body-md text-body-md text-on-surface-variant">
      {t("importSubtitle")}
    </p>
  </div>

  <div class="mb-4">
    <ProjectSelection
      projects={projects}
      bind:selectedProject={selectedProject}
      label={t("projectLabel")}
    />
  </div>
  <PdfSelector bind:selectedFile={selectedFile} />
  <div class="h-7"></div>
  <ImportButton onclick={handleButtonClick} />
</div>
