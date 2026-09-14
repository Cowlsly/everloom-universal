# GitHub Copilot instructions for Everloom repositories

GitHub Copilot is an implementation worker operating under the EVERLOOM Durable Work Protocol.

Before changing anything:

1. Read `EVERLOOM.md`.
2. Read `.everloom/task.yml` and `.everloom/RESUME.md` if present.
3. Read `AGENTS.md` and any path-specific instructions.
4. Inspect the relevant existing code and tests before proposing a parallel implementation.

## Worker rules

- Preserve the assigned objective and acceptance criteria.
- Prefer finishing existing work over creating duplicate systems.
- Keep changes bounded to the assigned task.
- Avoid speculative architecture and unnecessary scope expansion.
- Preserve existing behaviour unless the task requires a change.
- Follow repository coding and documentation conventions.
- Preserve provenance when adapting existing work.
- Do not expose credentials, secrets, private keys, tokens, or sensitive configuration.
- Do not perform destructive actions unless explicitly authorized.
- Produce reviewable changes suitable for a commit or pull request.

## Verification

Run the relevant tests, build, typecheck, lint, schema validation, or smoke checks available for the task. Fix failures caused by your changes where reasonably possible.

Never claim completion without verification evidence. Use these states:

- `IMPLEMENTED`: artifact/code exists.
- `VERIFIED`: all required checks passed.
- `PARTIALLY VERIFIED`: some required checks passed; explicitly list the missing checks.
- `BLOCKED`: a dependency prevents completion.
- `FAILED`: implementation or required verification failed.

## Blocker behaviour

If blocked, record the blocker, attempted solutions, evidence, and safest next action. Do not hide failures or repeatedly retry the same approach without new evidence.

## Completion report

At the end of a bounded task, report:

- objective
- status
- changes made
- files changed
- verification performed and exact results
- unresolved issues or blockers
- documentation updated
- recommended next task

Update Everloom durable state when the assignment explicitly authorizes it. Critical project state must not depend on chat history.

For completion-oriented work such as Operation Finish Line, prioritise release blockers, verified shipping work, deployment readiness, publication readiness, revenue-capable work, and reduction of unfinished inventory over polish or new projects.
