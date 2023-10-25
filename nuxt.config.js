import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
    },
    pageTransition: { name: "page", mode: "out-in" },
  },
  runtimeConfig: {
    public: {
      title: "C64 Graphics Collection",
      productionUrl: process.env.NUXT_PUBLIC_PRODUCTION_URL,
    },
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase",
    "@nuxtjs/google-fonts",
  ],
  css: ["~/assets/globals.css", "vuetify/lib/styles/main.sass"],
  build: {
    transpile: ["vuetify"],
  },
  tailwindcss: {
    cssPath: "~/assets/globals.css",
  },
  googleFonts: {
    preload: true,
    download: true,
    display: "swap",
    families: {
      Jost: true,
    },
  },
  supabase: {
    redirect: false,
  },
});
