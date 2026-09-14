---
description: Run a bounded EVERLOOM worker task and return a verification-aware completion report.
---

Read `EVERLOOM.md`, `.github/copilot-instructions.md`, `AGENTS.md`, `.everloom/task.yml`, and `.everloom/RESUME.md` before changing anything.

Execute the bounded task supplied by the user. Do not redefine the primary project objective or expand scope without necessity.

Required workflow:
1. Restate the bounded objective and acceptance criteria internally.
2. Inspect relevant existing implementation and tests.
3. Prefer finishing/reusing existing work over parallel systems.
4. Make the smallest coherent change that satisfies the task.
5. Run the required tests/build/lint/typecheck/schema checks.
6. Fix failures caused by your changes where practical.
7. Return an EVERLOOM completion report with status `IMPLEMENTED`, `VERIFIED`, `PARTIALLY VERIFIED`, `BLOCKED`, or `FAILED`.
8. Explicitly list verification performed, exact results, unperformed checks, blockers, files changed, and recommended next action.

Do not claim verification you did not perform. Do not expose secrets or perform destructive operations unless explicitly authorized.
