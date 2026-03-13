type DemoUser = {
  id: string;
  email: string;
  fullName: string;
  password: string;
};

type DemoProfile = {
  userId: string;
  fullName: string;
  degreeTarget: "MS" | "PhD" | "RA";
  researchInterests: string | null;
  preferredCountries: string | null;
  signatureBlock: string | null;
};

const users = new Map<string, DemoUser>();
const sessions = new Map<string, string>();
const profiles = new Map<string, DemoProfile>();

export const createDemoUser = (user: DemoUser) => {
  users.set(user.email, user);
  profiles.set(user.id, {
    userId: user.id,
    fullName: user.fullName,
    degreeTarget: "MS",
    researchInterests: null,
    preferredCountries: null,
    signatureBlock: null,
  });
  return user;
};

export const getDemoUserByEmail = (email: string) => users.get(email);

export const setDemoSession = (token: string, userId: string) => {
  sessions.set(token, userId);
};

export const clearDemoSession = (token: string) => {
  sessions.delete(token);
};

export const getDemoUserBySession = (token: string) => {
  const userId = sessions.get(token);
  if (!userId) return null;

  for (const user of users.values()) {
    if (user.id === userId) {
      return user;
    }
  }

  return null;
};

export const getDemoProfileByUserId = (userId: string) =>
  profiles.get(userId) ?? null;

export const upsertDemoProfile = (profile: DemoProfile) => {
  profiles.set(profile.userId, profile);
  return profile;
};
