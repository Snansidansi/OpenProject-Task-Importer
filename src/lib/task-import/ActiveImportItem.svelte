<script lang="ts">
  import { t } from "../../i18n"
  import type { ActiveImport } from "../../storage"

  let { importEntry, onCancel } = $props<{
    importEntry: ActiveImport
    onCancel: (id: string) => void
  }>()
</script>

<div
  class="bg-surface-container-low border-outline-variant mb-2 flex items-center gap-3 rounded-xl border px-3 py-2 last:mb-0"
>
  <span class="material-symbols-outlined text-primary text-xl">description</span>
  <span class="font-body-sm text-on-surface min-w-0 flex-1 truncate">
    {importEntry.fileName}
  </span>
  <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
  <button
    class="text-error hover:bg-error/10 flex h-7 w-7 items-center justify-center rounded-full transition-colors"
    onclick={() => onCancel(importEntry.id)}
    aria-label={t("importButtonStop")}
  >
    <span class="material-symbols-outlined text-xl">close</span>
  </button>
</div>
