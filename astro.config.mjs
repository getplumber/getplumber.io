import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import keystatic from "@keystatic/astro";
import compress from "@playform/compress";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, sharpImageService } from "astro/config";
import AutoImport from "astro-auto-import";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://getplumber.io",
  image: {
    service: sharpImageService({
      limitInputPixels: false, // Allow processing of large images like GIFs
    }),
  },
  adapter: vercel({
    imageService: false,
  }),
  // i18n configuration must match src/config/translations.json.ts
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    shikiConfig: {
      // Shiki Themes: https://shiki.style/themes
      theme: "css-variables",
      wrap: true,
    },
  },
  integrations: [
    // example auto import component into blog post mdx files
    AutoImport({
      imports: [
        // https://github.com/delucis/astro-auto-import
        "@components/Admonition/Admonition.astro",
        "@/docs/components/mdx-components/Aside.astro",
        "@/docs/components/mdx-components/Badge.astro",
        "@/docs/components/mdx-components/Button.astro",
        "@/docs/components/mdx-components/Steps.astro",
        "@/docs/components/mdx-components/Tabs.astro",
        "@/docs/components/mdx-components/TabsContent.astro",
        "@/docs/components/mdx-components/TabsList.astro",
        "@/docs/components/mdx-components/TabsTrigger.astro",
      ],
    }),
    expressiveCode({
      // Mono design: single high-contrast theme for doc code blocks so they look
      // the same on all OS (avoids contrast issues on macOS with default dark theme).
      themes: ["github-dark-high-contrast"],
      useDarkModeMediaQuery: false,
      // Ensure syntax token contrast (URLs, strings, paths) meets accessibility.
      minSyntaxHighlightingColorContrast: 5.5,
    }),
    mdx(),
    react(),
    icon(),
    keystatic(),
    sitemap(),
    compress({
      HTML: true,
      JavaScript: true,
      CSS: false, // enabling this can cause issues
      Image: false, // astro:assets handles this. Enabling this can dramatically increase build times
      SVG: false, // astro-icon handles this
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    // stop inlining short scripts to fix issues with ClientRouter
    build: {
      assetsInlineLimit: 0,
    },
  },
});
