<script lang="ts">
  import { t } from "../../i18n"

  let { onclick } = $props<{
    onclick: (event: MouseEvent) => void
  }>()

  let stateClasses = $derived(
    "bg-primary text-on-primary shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5",
  )
</script>

<button
  class="font-headline-md text-headline-md flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl py-5 transition-all duration-200 active:scale-95 {stateClasses}"
  onclick={onclick}
>
  <span class="material-symbols-outlined">auto_awesome</span>
  {t("importButtonStart")}
</button>
