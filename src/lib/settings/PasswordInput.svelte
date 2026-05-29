<script lang="ts">
  let {
    label,
    id,
    placeholder = null,
    icon = null,
    helperText = null,
    value = $bindable(""),
  } = $props<{
    label: string
    id: string
    placeholder?: string
    icon?: string
    helperText?: string
    value: string
  }>()
</script>

<div class="space-y-2">
  <label class="font-label-md text-label-md text-on-surface" for={id}>{label}</label>
  <div class="relative">
    {#if icon}
      <span
        class="material-symbols-outlined text-outline-variant absolute top-1/2 left-3 -translate-y-1/2"
        >{icon}</span
      >
    {/if}
    <input
      type="password"
      class="bg-surface border-outline-variant/30 font-body-md text-on-surface focus:ring-primary focus:border-primary soft-glow-focus w-full rounded-xl border py-3 pr-4 pl-10 transition-all outline-none"
      id={id}
      placeholder={placeholder}
      bind:value={value}
    />
    {#if icon}
      <span
        class="material-symbols-outlined text-outline-variant absolute top-1/2 right-3 -translate-y-1/2"
      ></span>
    {/if}
  </div>
  {#if helperText}
    <p class="text-on-surface-variant px-1 text-[11px]">{helperText}</p>
  {/if}
</div>
