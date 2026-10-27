import { defineEcConfig } from "astro-expressive-code";

/**
 * Expressive Code options. They live here rather than in astro.config.mjs because the
 * `<Code>` component (issue pages) loads the config itself and needs this file once the
 * options hold functions (theme selector, per-theme background).
 */
export default defineEcConfig({
  // One high-contrast theme per site mode (the same on every OS), switched by the
  // `.dark` class the theme toggle sets; the frame colours come from styleOverrides.
  themes: ["github-dark-high-contrast", "github-light-high-contrast"],
  themeCssSelector: (theme) => (theme.type === "dark" ? ".dark" : ":root:not(.dark)"),
  useDarkModeMediaQuery: false,
  // Ensure syntax token contrast (URLs, strings, paths) meets accessibility.
  minSyntaxHighlightingColorContrast: 5.5,
  // Figma docs terminal: tint surfaces, 15px radius, Geist Mono, flat header
  styleOverrides: {
    borderRadius: "15px",
    borderColor: "rgba(92, 98, 98, 0.25)",
    borderWidth: "1px",
    codeFontFamily: '"Geist Mono Variable", "SFMono-Regular", Menlo, Consolas, monospace',
    codeFontSize: "0.875rem",
    codeLineHeight: "1.75",
    codePaddingBlock: "1.5rem",
    codePaddingInline: "1.5rem",
    // tint-5 composited over each mode's page colour: opaque, so the contrast pass
    // (minSyntaxHighlightingColorContrast) measures the light theme against a light surface
    codeBackground: ({ theme }) => (theme.type === "dark" ? "#101010" : "#ebecec"),
    uiFontFamily: '"InterVariable", Inter, sans-serif',
    uiFontSize: "0.875rem",
    frames: {
      shadowColor: "transparent",
      frameBoxShadowCssValue: "none",
      editorBackground: "rgba(92, 98, 98, 0.05)",
      editorTabBarBackground: "rgba(92, 98, 98, 0.05)",
      editorTabBarBorderBottomColor: "rgba(92, 98, 98, 0.25)",
      editorTabBarBorderColor: "transparent",
      editorActiveTabBackground: "transparent",
      editorActiveTabForeground: "#8d9596",
      editorActiveTabIndicatorTopColor: "transparent",
      editorActiveTabIndicatorBottomColor: "#09c3c3",
      terminalBackground: "rgba(92, 98, 98, 0.05)",
      terminalTitlebarBackground: "rgba(92, 98, 98, 0.05)",
      terminalTitlebarBorderBottomColor: "rgba(92, 98, 98, 0.25)",
      terminalTitlebarDotsForeground: "#8d9596",
      terminalTitlebarDotsOpacity: "0",
      terminalTitlebarForeground: "#8d9596",
      inlineButtonBackground: "rgba(141, 149, 150, 0.05)",
      inlineButtonBackgroundIdleOpacity: "1",
      inlineButtonBackgroundHoverOrFocusOpacity: "1",
      inlineButtonBorder: "rgba(141, 149, 150, 0.25)",
      inlineButtonBorderOpacity: "1",
      inlineButtonForeground: "#8d9596",
      tooltipSuccessBackground: "#09c3c3",
      tooltipSuccessForeground: "#0c0c0c",
    },
  },
});
