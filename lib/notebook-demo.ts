/**
 * Demo Configuration Utility
 * Used for managing internal feature flags and author attribution.
 */
export const DemoSettings = {
  active: false,
  author: "suja rahaman",
  description: "Demo configurations for DocuMind testing.",
  version: "1.0.0"
}

export function initDemo() {
  if (DemoSettings.active) {
    console.log("Demo initiated by", DemoSettings.author)
  }
}
