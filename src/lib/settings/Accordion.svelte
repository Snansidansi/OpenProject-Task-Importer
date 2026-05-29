<script lang="ts">
  import type { Snippet } from "svelte"

  const { title, id, children } = $props<{
    title: string
    id: string
    children: Snippet
  }>()

  let isOpen = $state(false)

  function toggle() {
    isOpen = !isOpen
  }
</script>

<div class="space-y-2" id={id + "-accordion"}>
  <button
    class="group flex w-full items-center justify-between py-2"
    onclick={toggle}
    type="button"
  >
    <span class="font-label-md text-label-md text-on-surface">{title}</span>
    <span
      class="material-symbols-outlined chevron text-outline-variant group-hover:text-primary transition-colors"
      >{isOpen ? "expand_less" : "expand_more"}</span
    >
  </button>
  <div class={isOpen ? "space-y-2 transition-all" : "hidden space-y-2 transition-all"}>
    {@render children()}
  </div>
</div>
