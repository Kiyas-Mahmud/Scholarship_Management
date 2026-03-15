/* eslint-disable no-console */

const baseUrl = (process.env.API_BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

const email = `regression.${Date.now()}@example.com`;
const wrongPassword = "WrongPass123!";
const password = "Regression123!";
const fullName = "Regression User";

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
  assert(
    result.status >= 200 && result.status < 300,
    `${label}: expected 2xx, got ${result.status}`,
  );
  assert(result.data?.ok === true, `${label}: expected ok=true`);
};

const expectError = (result, status, code, label) => {
  assert(
    result.status === status,
    `${label}: expected ${status}, got ${result.status}`,
  );
  assert(result.data?.ok === false, `${label}: expected ok=false`);
  assert(
    result.data?.error?.code === code,
    `${label}: expected error code ${code}, got ${result.data?.error?.code}`,
  );
};

const runStep = async (label, fn) => {
  process.stdout.write(`- ${label} ... `);
  await fn();
  console.log("ok");
};

const run = async () => {
  console.log(`Running auth regression test against ${baseUrl}`);

  await runStep("me requires auth before login", async () => {
    const me = await requestJson("GET", "/api/me");
    expectError(me, 401, "UNAUTHENTICATED", "me before login");
  });

  await runStep("signup success", async () => {
    const signup = await requestJson("POST", "/api/auth/signup", {
      email,
      password,
      fullName,
    });
    expectOk(signup, "signup");
  });

  await runStep("duplicate signup blocked", async () => {
    const duplicateSignup = await requestJson("POST", "/api/auth/signup", {
      email,
      password,
      fullName,
    });
    expectError(duplicateSignup, 409, "EMAIL_EXISTS", "duplicate signup");
  });

  await runStep("logout clears session", async () => {
    const logout = await requestJson("POST", "/api/auth/logout");
    expectOk(logout, "logout");

    const meAfterLogout = await requestJson("GET", "/api/me");
    expectError(meAfterLogout, 401, "UNAUTHENTICATED", "me after logout");
  });

  await runStep("invalid login blocked", async () => {
    const invalidLogin = await requestJson("POST", "/api/auth/login", {
      email,
      password: wrongPassword,
    });
    expectError(invalidLogin, 401, "INVALID_CREDENTIALS", "invalid login");
  });

  await runStep("valid login success", async () => {
    const login = await requestJson("POST", "/api/auth/login", {
      email,
      password,
    });
    expectOk(login, "login");
  });

  await runStep("profile update sanitizes values", async () => {
    const profilePut = await requestJson("PUT", "/api/profile", {
      fullName: "  Regression User Updated  ",
      degreeTarget: "MS",
      researchInterests: "   ",
      preferredCountries: "  Canada, Germany  ",
      signatureBlock: "  Best regards  ",
    });

    expectOk(profilePut, "profile put");

    const profile = profilePut.data?.data;
    assert(
      profile?.fullName === "Regression User Updated",
      "profile fullName not trimmed",
    );
    assert(
      profile?.researchInterests === null,
      "researchInterests should normalize to null",
    );
    assert(
      profile?.preferredCountries === "Canada, Germany",
      "preferredCountries not trimmed",
    );
    assert(
      profile?.signatureBlock === "Best regards",
      "signatureBlock not trimmed",
    );
  });

  await runStep("profile payload validation enforced", async () => {
    const badProfile = await requestJson("PUT", "/api/profile", {
      fullName: "x",
      degreeTarget: "MBA",
      researchInterests: null,
      preferredCountries: null,
      signatureBlock: null,
    });

    expectError(badProfile, 422, "VALIDATION_ERROR", "bad profile payload");
  });

  console.log("Auth regression test passed.");
};

run().catch((error) => {
  console.error("Auth regression test failed:", error.message);
  process.exitCode = 1;
});
