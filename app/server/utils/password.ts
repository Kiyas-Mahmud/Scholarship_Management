import { compare, hash } from "bcryptjs";

export const hashPassword = (plain: string) => hash(plain, 12);

export const verifyPassword = (plain: string, passwordHash: string) =>
  compare(plain, passwordHash);
