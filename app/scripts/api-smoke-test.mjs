/* eslint-disable no-console */

const baseUrl = (process.env.API_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

const email = `smoke.${Date.now()}@example.com`;
const password = "SmokeTest123!";
const fullName = "Smoke Test User";

let cookieHeader = "";

const parseSetCookie = (setCookieHeader) => {
  if (!setCookieHeader) {
    return "";
  }

  return setCookieHeader
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.includes("="))
    .map((part) => part.split(";")[0])
    .join("; ");
};

const requestJson = async (method, path, body) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    cookieHeader = parseSetCookie(setCookie);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    status: response.status,
    data,
  };
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const expectOk = (result, label) => {
  assert(result.status >= 200 && result.status < 300, `${label}: expected 2xx, got ${result.status}`);
  assert(result.data?.ok === true, `${label}: expected ok=true`);
};

const expectError = (result, status, code, label) => {
  assert(result.status === status, `${label}: expected ${status}, got ${result.status}`);
  assert(result.data?.ok === false, `${label}: expected ok=false`);
  assert(result.data?.error?.code === code, `${label}: expected error code ${code}, got ${result.data?.error?.code}`);
};

const run = async () => {
  console.log(`Running API smoke test against ${baseUrl}`);

  const signup = await requestJson("POST", "/api/auth/signup", {
    email,
    password,
    fullName,
  });
  expectOk(signup, "signup");

  const meAfterSignup = await requestJson("GET", "/api/me");
  expectOk(meAfterSignup, "me after signup");

  const profileGet = await requestJson("GET", "/api/profile");
  expectOk(profileGet, "profile get");

  const profilePut = await requestJson("PUT", "/api/profile", {
    fullName: `${fullName} Updated`,
    degreeTarget: "MS",
    researchInterests: "AI, Systems",
    preferredCountries: "Canada, Germany",
    signatureBlock: "Best regards",
  });
  expectOk(profilePut, "profile put");

  const logout = await requestJson("POST", "/api/auth/logout");
  expectOk(logout, "logout");

  const meAfterLogout = await requestJson("GET", "/api/me");
  expectError(meAfterLogout, 401, "UNAUTHENTICATED", "me after logout");

  const login = await requestJson("POST", "/api/auth/login", {
    email,
    password,
  });
  expectOk(login, "login");

  const meAfterLogin = await requestJson("GET", "/api/me");
  expectOk(meAfterLogin, "me after login");

  console.log("API smoke test passed.");
};

run().catch((error) => {
  console.error("API smoke test failed:", error.message);
  process.exitCode = 1;
});
