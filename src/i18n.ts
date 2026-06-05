export function t(key: string): string {
  if (typeof chrome === "undefined" || !chrome.i18n) {
    return `[${key}]`
  }

  return chrome.i18n.getMessage(key) || `[${key}]`
}
