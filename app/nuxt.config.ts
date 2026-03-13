// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  nitro: {
    preset: "cloudflare-pages",
    cloudflare: {
      nodeCompat: true,
    },
  },
  runtimeConfig: {
    sessionSecret: "",
    appBaseUrl: "",
    r2BucketName: "",
    bkashAppKey: "",
    bkashAppSecret: "",
    bkashUsername: "",
    bkashPassword: "",
    bkashCallbackUrl: "",
    nagadMerchantId: "",
    nagadMerchantPrivateKey: "",
    nagadCallbackUrl: "",
    public: {
      appEnv: "development",
    },
  },
  routeRules: {
    "/api/**": {
      cors: true,
    },
  },
});
