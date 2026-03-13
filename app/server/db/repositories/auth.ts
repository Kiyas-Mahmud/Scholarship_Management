import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq, gt } from "drizzle-orm";
import { sessions } from "~/server/db/schema/sessions";
import { profiles, users } from "~/server/db/schema/users";

type Db = NonNullable<
  ReturnType<typeof import("~/server/db/connection").getDb>
>;

type UserRecord = InferSelectModel<typeof users>;
type ProfileRecord = InferSelectModel<typeof profiles>;

type NewUser = InferInsertModel<typeof users>;
type NewProfile = InferInsertModel<typeof profiles>;

const nowIso = () => new Date().toISOString();

export const findUserByEmail = async (db: NonNullable<Db>, email: string) => {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return rows[0] ?? null;
};

export const findUserById = async (db: NonNullable<Db>, userId: string) => {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return rows[0] ?? null;
};

export const createUserWithProfile = async (
  db: NonNullable<Db>,
  user: NewUser,
  profile: NewProfile,
) => {
  await db.insert(users).values(user);
  await db.insert(profiles).values(profile);

  return {
    user: user as UserRecord,
    profile: profile as ProfileRecord,
  };
};

export const createSession = async (
  db: NonNullable<Db>,
  token: string,
  userId: string,
  expiresAt: string,
) => {
  await db.insert(sessions).values({ token, userId, expiresAt });
};

export const deleteSession = async (db: NonNullable<Db>, token: string) => {
  await db.delete(sessions).where(eq(sessions.token, token));
};

export const findUserByValidSession = async (
  db: NonNullable<Db>,
  token: string,
) => {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      fullName: profiles.fullName,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, nowIso())))
    .limit(1);

  return rows[0] ?? null;
};

export const getProfileByUserId = async (
  db: NonNullable<Db>,
  userId: string,
) => {
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  return rows[0] ?? null;
};

export const updateProfileByUserId = async (
  db: NonNullable<Db>,
  userId: string,
  input: Pick<
    NewProfile,
    | "fullName"
    | "degreeTarget"
    | "researchInterests"
    | "preferredCountries"
    | "signatureBlock"
  >,
) => {
  await db
    .update(profiles)
    .set({
      ...input,
      updatedAt: nowIso(),
    })
    .where(eq(profiles.userId, userId));

  const updated = await getProfileByUserId(db, userId);
  return updated;
};
