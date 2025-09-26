export default defineNuxtConfig({
  devtools: { enabled: false },

  // MODULES
  modules: [
    "@nuxt/image",
    "@pinia/nuxt",
    "@nuxtjs/sanity",
    "@nuxt/icon",
    "@nuxtjs/tailwindcss",
  ],

  sanity: {
    projectId: process.env.SANITY_ID as string,
    dataset: "production",
  },

  vite: {
    server: {
      allowedHosts: ["0dd4ecfb1526.ngrok-free.app"],
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
      exclude: ["@sanity/visual-editing", "@sanity/ui", "@sanity/insert-menu"],
    },
    ssr: {
      noExternal: [
        "@sanity/visual-editing",
        "@sanity/ui",
        "@sanity/insert-menu",
      ],
    },
    resolve: {
      alias: {
        "react-compiler-runtime": "react-compiler-runtime/dist/index.js",
      },
    },
  },

  app: {
    head: {
      title: "Tobias Blickle",
      link: [
        {
          rel: "icon",
          href: "/favicon.ico",
        },
      ],
      meta: [
        {
          name: "description",
          content: "Cinematographer",
        },
      ],
      htmlAttrs: {
        lang: "en",
      },
      bodyAttrs: {
        class: "overflow-x-hidden",
      },
    },
    pageTransition: { name: "page", mode: "out-in" },
  },

  compatibilityDate: "2024-12-22",
});
