<script lang="ts">
  let {
    label,
    id,
    placeholder = null,
    rows = undefined,
    helperText = null,
    value = $bindable(""),
  } = $props<{
    label: string
    id: string
    placeholder?: string | null
    rows?: number
    helperText?: string | null
    value: string
  }>()
</script>

<div class="space-y-2">
  <label class="font-label-md text-label-md text-on-surface" for={id}>{label}</label>

  <textarea
    class="auto-textarea bg-surface-container-low border-outline-variant/30 font-body-md text-on-surface focus:ring-primary focus:border-primary w-full rounded-xl border p-4 transition-all outline-none"
    id={id}
    placeholder={placeholder ?? undefined}
    rows={rows}
    bind:value={value}
  ></textarea>

  {#if helperText}
    <p class="text-on-surface-variant px-1 text-[11px]">{helperText}</p>
  {/if}
</div>

<style>
  .auto-textarea:not([rows]) {
    field-sizing: content;
    min-height: 3lh;
  }
</style>
