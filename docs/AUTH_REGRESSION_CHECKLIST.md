# AUTH_REGRESSION_CHECKLIST.md

## Purpose

Run this checklist before merging auth/profile related changes into `version1`.

## Preconditions

1. Development server is running: `npm run dev`
2. Database schema is applied.
3. API base URL is reachable at `http://127.0.0.1:3000` or custom `API_BASE_URL`.

## Automated Regression Command

```bash
npm --prefix app run test:regression:auth
```

## Covered Scenarios

- unauthenticated `GET /api/me` is blocked
- signup success
- duplicate signup blocked
- logout clears session
- invalid login blocked
- valid login success
- profile update sanitizes text/nullable values
- invalid profile payload returns validation error

## Manual Spot Checks

1. Confirm browser cookie is removed after logout.
2. Confirm login from a second device invalidates old session when required.
3. Confirm profile fields are trimmed in UI after save.

## Expected Result

- Command exits with code `0`.
- Output ends with `Auth regression test passed.`
