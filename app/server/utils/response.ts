export type ApiErrorPayload = {
  code: string;
  message: string;
};

export const ok = <T>(data: T) => ({
  ok: true as const,
  data,
});

export const fail = (statusCode: number, error: ApiErrorPayload) => {
  throw createError({
    statusCode,
    data: {
      ok: false,
      error,
    },
  });
};
