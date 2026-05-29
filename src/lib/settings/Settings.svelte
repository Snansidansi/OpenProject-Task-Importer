<script lang="ts">
  import TextInput from "./TextInput.svelte"
  import PasswordInput from "./PasswordInput.svelte"
  import TextArea from "./TextArea.svelte"
  import Accordion from "./Accordion.svelte"
  import Footer from "./Footer.svelte"

  let opUrl = $state("")
  let opToken = $state("")
  let orKey = $state("")
  let aiModel = $state("")
  let kiPrompt = $state("")
</script>

<div class="text-on-background flex w-full flex-col items-center">
  <div
    class="ambient-card flex w-full flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0px_20px_24px_-4px_rgba(0,0,0,0.04)]"
  >
    <TextInput
      label="OpenProject URL"
      id="op_url"
      placeholder="https://openproject-instanz.com"
      icon="link"
      bind:value={opUrl}
    />

    <PasswordInput
      label="OpenProject Token"
      id="op_token"
      placeholder="Ihr API Zugriffsschlüssel"
      icon="key"
      bind:value={opToken}
    />

    <PasswordInput
      label="OpenRouter API Key"
      id="or_key"
      placeholder="sk-or-v1-..."
      icon="key"
      bind:value={orKey}
    />

    <TextInput
      label="KI Modell"
      id="ai_model"
      placeholder="KI Modell suchen..."
      icon="smart_toy"
      bind:value={aiModel}
    />

    <Accordion title="Erweiterte Prompt-Einstellungen" id="prompt">
      <TextArea
        label="KI Prompt"
        id="ki_prompt"
        placeholder="System-Instruktionen hier eingeben..."
        rows={4}
        bind:value={kiPrompt}
      />
    </Accordion>
  </div>

  <Footer />
</div>
