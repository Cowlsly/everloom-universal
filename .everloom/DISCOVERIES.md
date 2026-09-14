# Everloom Discoveries

## 2026-09-14 — Dedicated repository established

**Source:** repository inspection and owner-supplied v1.0.0 bundle.

**Finding:** `Cowlsly/everloom-universal` is now the canonical repository for the generalized Everloom protocol. The repository initially contained only the uploaded archive, a short README, a license, and `New.txt` describing the desired Copilot integration.

**Verification state:** CONFIRMED.

**Impact:** maintain the actual protocol as normal repository files rather than relying on the ZIP as the operational source.

## 2026-09-14 — Copilot role boundary

**Source:** `New.txt` integration objective.

**Finding:** GitHub Copilot is an execution worker under Everloom, not the orchestration authority. It receives bounded tasks, performs implementation, verifies work, and returns a structured completion report.

**Verification state:** CONFIRMED design requirement.

**Impact:** native Copilot instructions must preserve project objective and scope while producing Everloom-compatible handoffs.

## 2026-09-14 — Verification vocabulary

**Source:** integration objective.

**Finding:** worker completion needs explicit states: IMPLEMENTED, VERIFIED, PARTIALLY VERIFIED, BLOCKED, FAILED.

**Verification state:** IMPLEMENTED in protocol/documentation.

**Impact:** prevents code-written from being treated as task-complete without evidence.
