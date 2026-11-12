/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  /** Plausible tracker (queue stub until /js/script.js loads), defined inline in the BaseHead layouts */
  plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
}
