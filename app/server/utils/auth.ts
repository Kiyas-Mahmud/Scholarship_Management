import type { H3Event } from "h3";
import { nanoid } from "nanoid";
import { z } from "zod";

const SESSION_COOKIE = "sos_session";

const emailSchema = z
  .string()
  .trim()
  .min(1)
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8)
  .max(128)
  .refine((value) => /[a-z]/.test(value), {
    message: "Password must include at least one lowercase letter.",
  })
  .refine((value) => /[A-Z]/.test(value), {
    message: "Password must include at least one uppercase letter.",
  })
  .refine((value) => /\d/.test(value), {
    message: "Password must include at least one number.",
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: "Password must include at least one special character.",
  });

const fullNameSchema = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .transform((value) => value.replace(/\s+/g, " "));

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
});

export const parseSignupBody = async (event: H3Event) => {
  const body = await readBody(event);
  return signupSchema.parse(body);
};

export const parseLoginBody = async (event: H3Event) => {
  const body = await readBody(event);
  return loginSchema.parse(body);
};

export const createSessionToken = () => nanoid(48);

export const getSessionExpiryIso = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt.toISOString();
};

export const setSessionCookie = (event: H3Event, token: string) => {
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearSessionCookie = (event: H3Event) => {
  deleteCookie(event, SESSION_COOKIE, {
    path: "/",
  });
};

export const getSessionToken = (event: H3Event) =>
  getCookie(event, SESSION_COOKIE) ?? null;
