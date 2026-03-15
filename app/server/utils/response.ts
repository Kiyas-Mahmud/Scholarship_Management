import { createError, defineEventHandler, isError, type H3Event } from "h3";
import { ZodError } from "zod";

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export const ok = <T>(data: T) => ({
  ok: true as const,
  data,
});

export const fail = (statusCode: number, error: ApiErrorPayload) => {
  throw createError({
    statusCode,
    statusMessage: error.message,
    data: {
      ok: false,
      error,
    },
  });
};

const toDefaultCode = (statusCode: number) => {
  if (statusCode === 400) return "BAD_REQUEST";
  if (statusCode === 401) return "UNAUTHORIZED";
  if (statusCode === 403) return "FORBIDDEN";
  if (statusCode === 404) return "NOT_FOUND";
  if (statusCode === 409) return "CONFLICT";
  if (statusCode === 422) return "VALIDATION_ERROR";
  if (statusCode === 429) return "RATE_LIMITED";
  return "INTERNAL_ERROR";
};

const normalizeError = (error: unknown) => {
  if (error instanceof ZodError) {
    return createError({
      statusCode: 422,
      statusMessage: "Request validation failed.",
      data: {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details: error.flatten(),
        },
      },
    });
  }

  if (isError(error)) {
    const existingData = error.data as
      | {
          ok?: boolean;
          error?: ApiErrorPayload;
        }
      | undefined;

    if (existingData?.ok === false && existingData.error?.code) {
      return error;
    }

    const statusCode =
      typeof error.statusCode === "number" && error.statusCode >= 400
        ? error.statusCode
        : 500;

    const message =
      statusCode >= 500
        ? "Unexpected server error."
        : (error.statusMessage ?? error.message ?? "Request failed.");

    return createError({
      statusCode,
      statusMessage: message,
      data: {
        ok: false,
        error: {
          code: toDefaultCode(statusCode),
          message,
        },
      },
    });
  }

  return createError({
    statusCode: 500,
    statusMessage: "Unexpected server error.",
    data: {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected server error.",
      },
    },
  });
};

export const withErrorHandling = <T>(
  handler: (event: H3Event) => Promise<T> | T,
) =>
  defineEventHandler(async (event) => {
    try {
      return await handler(event);
    } catch (error) {
      throw normalizeError(error);
    }
  });
