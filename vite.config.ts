import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import webExtension from "vite-plugin-web-extension"
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    webExtension({
      manifest: "public/manifest.json",
      disableAutoLaunch: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name].js",
      },
    },
  },
})
