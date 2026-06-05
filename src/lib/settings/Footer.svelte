<script lang="ts">
  import { t } from "../../i18n"
</script>

<div class="mt-stack-sm flex flex-col items-center gap-2 text-center">
  <div class="flex">
    <span class="material-symbols-outlined pr-1 text-[18px]">link</span>
    <a
      class="text-primary font-label-md flex items-center gap-1 hover:underline"
      href="https://github.com/Snansidansi/OpenProject-Task-Importer"
      rel="noopener"
      target="_blank"
    >
      {t("githubLink")}
    </a>
  </div>
  <p class="text-label-sm text-on-surface-variant opacity-70">
    {t("notOfficialPlugin")}
  </p>
</div>
