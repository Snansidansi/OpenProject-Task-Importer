<script lang="ts">
  let {
    icon,
    text,
    active = false,
    onclick,
  } = $props<{
    icon: string
    text: string
    active?: boolean
    onclick: () => void
  }>()
</script>

<button
  class="flex cursor-pointer flex-col items-center gap-1 rounded-full px-4 py-1 transition-colors"
  class:text-on-secondary-container={active}
  class:bg-secondary-container={active}
  class:text-on-surface-variant={!active}
  class:hover:text-primary={!active}
  onclick={onclick}
>
  <span class="material-symbols-outlined">{icon}</span>
  <span class="font-label-sm text-label-sm">{text}</span>
</button>
