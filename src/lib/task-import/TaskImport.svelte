<script lang="ts">
  import type { StartProcessing, StopProcessing } from "../../background"
  import { showInfo } from "../../infoStore"
  import type { Project } from "../../openProject/openProjectTypes"
  import ImportButton from "./ImportButton.svelte"
  import PdfSelector from "./pdf-selector/PdfSelector.svelte"
  import ProjectSelection from "./ProjectSelection.svelte"
  import ActiveImportItem from "./ActiveImportItem.svelte"
  import { t } from "../../i18n"
  import { getValue, saveValue, StorageKey, type ActiveImport } from "../../storage"

  let { projects } = $props<{ projects: Project[] }>()

  let selectedProject: Project | null = $state(null)
  let selectedFile: File | null = $state(null)
  let projectsLoaded = $state(false)
  let activeImports = $state<ActiveImport[]>([])

  $effect(() => {
    if (projects.length > 0 && !projectsLoaded) {
      projectsLoaded = true
      if (selectedProject === null && projects.length > 0) {
        selectedProject = projects[0]
      }
    }
  })

  $effect(() => {
    const loadActiveImports = async () => {
      const stored = await getValue<ActiveImport[]>(StorageKey.ActiveImports)
      activeImports = stored ?? []
    }
    loadActiveImports()

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[StorageKey.ActiveImports]) {
        activeImports = changes[StorageKey.ActiveImports].newValue ?? []
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
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

    const fileName = selectedFile.name
    let fileData: ArrayBuffer
    try {
      fileData = await selectedFile.arrayBuffer()
    } catch (error) {
      showInfo((error as Error).message)
      return
    }
    const base64Data = arrayBufferToBase64(fileData)
    const id = crypto.randomUUID()

    const newImport: ActiveImport = { id, fileName }
    const updatedImports = [...activeImports, newImport]
    await saveValue(StorageKey.ActiveImports, updatedImports)

    const startMessage: StartProcessing = {
      type: "StartProcessing",
      id,
      fileData: base64Data,
      fileName: fileName,
      selectedProject: selectedProject,
    }
    selectedFile = null
    const info = await chrome.runtime.sendMessage(startMessage)

    if (info !== "") {
      showInfo(info)
    }
  }

  async function handleCancel(id: string) {
    const stopMessage: StopProcessing = {
      type: "StopProcessing",
      id,
    }
    await chrome.runtime.sendMessage(stopMessage)
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

  {#if activeImports.length > 0}
    <div class="mt-4">
      {#each activeImports as importEntry (importEntry.id)}
        <ActiveImportItem {importEntry} onCancel={handleCancel} />
      {/each}
    </div>
  {/if}
</div>
