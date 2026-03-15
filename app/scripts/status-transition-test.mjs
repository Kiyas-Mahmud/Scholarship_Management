/* eslint-disable no-console */

import {
  ALLOWED_STATUS_TRANSITIONS,
  PROFESSOR_STATUSES,
  isAllowedStatusTransition,
} from "../server/utils/professorStatus.mjs";

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = () => {
  const statuses = Object.values(PROFESSOR_STATUSES);

  for (const status of statuses) {
    assert(
      isAllowedStatusTransition(status, status),
      `Status should allow idempotent transition: ${status} -> ${status}`,
    );

    const allowed = ALLOWED_STATUS_TRANSITIONS[status] ?? [];

    for (const nextStatus of allowed) {
      assert(
        statuses.includes(nextStatus),
        `Invalid configured status target: ${status} -> ${nextStatus}`,
      );

      assert(
        isAllowedStatusTransition(status, nextStatus),
        `Expected transition to be allowed: ${status} -> ${nextStatus}`,
      );
    }
  }

  const blockedSamples = [
    [PROFESSOR_STATUSES.DRAFT, PROFESSOR_STATUSES.ACCEPTED],
    [PROFESSOR_STATUSES.SENT, PROFESSOR_STATUSES.ACCEPTED],
    [PROFESSOR_STATUSES.ACCEPTED, PROFESSOR_STATUSES.INTERVIEW],
    [PROFESSOR_STATUSES.REJECTED, PROFESSOR_STATUSES.SENT],
  ];

  for (const [fromStatus, toStatus] of blockedSamples) {
    assert(
      !isAllowedStatusTransition(fromStatus, toStatus),
      `Expected transition to be blocked: ${fromStatus} -> ${toStatus}`,
    );
  }

  console.log("Status transition regression test passed.");
};

try {
  run();
} catch (error) {
  console.error("Status transition regression test failed:", error.message);
  process.exitCode = 1;
}
