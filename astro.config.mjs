// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://teach-timechecker.calavium.com",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
