<script lang="ts">
  import { infoMessage, clearInfo } from "../infoStore"
</script>

{#if $infoMessage}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div
      class="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-lg border border-red-100 bg-white p-6 shadow-xl"
    >
      <button
        onclick={clearInfo}
        class="absolute top-3 right-3 z-10 text-gray-400 transition-colors hover:text-gray-600"
        aria-label="Schließen"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div class="flex min-h-0 flex-1 flex-col items-center text-center">
        <h3 class="mb-2 text-lg font-semibold text-gray-900">Information</h3>
      </div>

      <div class="w-full overflow-y-auto px-2">
        <p class="text-left text-sm wrap-break-word text-gray-600">{$infoMessage}</p>
      </div>
    </div>
  </div>
{/if}
