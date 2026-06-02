<script lang="ts">
  import type { TaskAttributeData } from "../../../openProject/openProjectTypes"
  import TextInput from "../TextInput.svelte"

  let { name, data } = $props<{
    name: string
    data: TaskAttributeData
  }>()
</script>

<label for="task-attr-{name}">
  <div class="px-stack-md pb-stack-md border-outline-variant/20 pt-stack-sm space-y-2 border-t">
    <div
      class="gap-stack-md hover:bg-surface-variant/30 flex items-center rounded-lg p-3 transition-colors"
    >
      <input
        bind:checked={data.allowedForLLM}
        class="border-outline-variant text-primary focus:ring-primary h-5 w-5 rounded"
        type="checkbox"
        id="task-attr-{name}"
        disabled={data.required}
      />
      <div class="flex items-center gap-2">
        <span class="font-body-md text-on-surface">{name}</span>
        <span class="text-xs text-gray-400 italic">({data.type})</span>
      </div>
      {#if data.required}
        <span class="ml-auto text-sm font-bold text-red-500">Pflichtfeld</span>
      {/if}
    </div>
    <TextInput
      id={`task-attr-${name}-note`}
      label=""
      placeholder="Notiz für LLM"
      icon="info"
      bind:value={data.llmNote}
    />
  </div>
</label>
