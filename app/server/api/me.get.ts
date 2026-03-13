import { requireUser } from "~/server/utils/requireUser";
import { ok } from "~/server/utils/response";

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event);

  return ok({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
    entitlements: {
      limits: {
        maxProfessors: 10,
        maxTemplates: 2,
      },
      features: {
        export: false,
        analytics: false,
      },
    },
  });
});
