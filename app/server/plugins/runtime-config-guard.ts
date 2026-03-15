import { getValidatedRuntimeConfig } from "~/server/utils/runtimeConfig";

let initialized = false;

export default defineNitroPlugin(() => {
  if (initialized) {
    return;
  }

  // Validate once on startup so misconfiguration fails fast.
  getValidatedRuntimeConfig();
  initialized = true;
});
