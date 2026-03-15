import { fail } from "~/server/utils/response";
import { getCurrentSubscription } from "~/server/db/repositories/billing";

type Db = NonNullable<
  ReturnType<typeof import("~/server/db/connection").getDb>
>;

export type EntitlementLimits = {
  maxProfessors: number;
  maxTemplates: number;
};

export type EntitlementFeatures = {
  export: boolean;
  analytics: boolean;
};

export type Entitlements = {
  plan: {
    id: string;
    name: string;
    billingPeriod: string;
  };
  limits: EntitlementLimits;
  features: EntitlementFeatures;
  subscription: {
    id: string | null;
    status: string | null;
    startAt: string | null;
    endAt: string | null;
  };
};

const FREE_PLAN_ENTITLEMENTS: Entitlements = {
  plan: {
    id: "free",
    name: "Free",
    billingPeriod: "monthly",
  },
  limits: {
    maxProfessors: 10,
    maxTemplates: 2,
  },
  features: {
    export: false,
    analytics: false,
  },
  subscription: {
    id: null,
    status: null,
    startAt: null,
    endAt: null,
  },
};

const toBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }

  return false;
};

const toPositiveInt = (value: unknown, fallback: number) => {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  return Number.isFinite(numberValue) && numberValue > 0
    ? Math.floor(numberValue)
    : fallback;
};

const parsePlanEntitlements = (
  limitsJson: string,
): {
  limits: EntitlementLimits;
  features: EntitlementFeatures;
} => {
  try {
    const parsed = JSON.parse(limitsJson) as {
      professor_limit?: unknown;
      template_limit?: unknown;
      export?: unknown;
      analytics?: unknown;
    };

    return {
      limits: {
        maxProfessors: toPositiveInt(
          parsed.professor_limit,
          FREE_PLAN_ENTITLEMENTS.limits.maxProfessors,
        ),
        maxTemplates: toPositiveInt(
          parsed.template_limit,
          FREE_PLAN_ENTITLEMENTS.limits.maxTemplates,
        ),
      },
      features: {
        export: toBoolean(parsed.export),
        analytics: toBoolean(parsed.analytics),
      },
    };
  } catch {
    return {
      limits: { ...FREE_PLAN_ENTITLEMENTS.limits },
      features: { ...FREE_PLAN_ENTITLEMENTS.features },
    };
  }
};

export const getEntitlements = async (db: Db, userId: string): Promise<Entitlements> => {
  const current = await getCurrentSubscription(db, userId);

  if (!current) {
    return { ...FREE_PLAN_ENTITLEMENTS };
  }

  const parsed = parsePlanEntitlements(current.plan.limitsJson);

  return {
    plan: {
      id: current.plan.id,
      name: current.plan.name,
      billingPeriod: current.plan.billingPeriod,
    },
    limits: parsed.limits,
    features: parsed.features,
    subscription: {
      id: current.subscription.id,
      status: current.subscription.status,
      startAt: current.subscription.startAt,
      endAt: current.subscription.endAt,
    },
  };
};

export const guardFeature = (
  entitlements: Entitlements,
  feature: keyof EntitlementFeatures,
  message: string,
) => {
  if (!entitlements.features[feature]) {
    fail(403, {
      code: "FEATURE_NOT_AVAILABLE",
      message,
    });
  }
};

export const guardUsageLimit = (
  used: number,
  maxAllowed: number,
  details: {
    resource: string;
    code: string;
    message: string;
  },
) => {
  if (used >= maxAllowed) {
    fail(403, {
      code: details.code,
      message: details.message,
      details: {
        resource: details.resource,
        used,
        maxAllowed,
      },
    });
  }
};
