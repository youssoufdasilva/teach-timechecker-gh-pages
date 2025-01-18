// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://astro.exps.youssoufdasilva.com",
  integrations: [
    react(), // instead of react({ experimentalReactChildren: true })
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
