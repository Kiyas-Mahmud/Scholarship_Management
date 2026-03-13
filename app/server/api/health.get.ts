import { ok } from "~/server/utils/response";

export default defineEventHandler(() => {
  return ok({
    service: "scholarship-outreach-api",
    status: "healthy",
    now: new Date().toISOString(),
  });
});
