import { writable } from "svelte/store"

export const infoMessage = writable<string | null>(null)

export function showInfo(text: string) {
  infoMessage.set(text)
}

export function clearInfo() {
  infoMessage.set(null)
}
