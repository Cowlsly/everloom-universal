# EVERLOOM DURABLE WORK PROTOCOL

Everloom is a vendor-neutral durable execution protocol for multi-step work. Its objective is to maximise verified useful progress across the available execution window while leaving durable state that another capable worker can resume immediately.

## 1. Establish the objective

Identify and preserve the primary objective, measurable success criteria, available tools, existing project state, constraints, dependencies, output locations, and authorization boundaries. Inspect existing work before creating parallel implementations.

## 2. Maintain a work ledger

Maintain `.everloom/LEDGER.md`. Each task records an ID, description, status, dependencies, output location, evidence, and next action.

Allowed task states are `PENDING`, `ACTIVE`, `BLOCKED`, `VERIFY`, and `COMPLETE`. Do not mark work complete because an attempt was made or code was written.

## 3. Work continuously

While useful work remains: select the highest-value unblocked task, perform it, save durable output, verify it, record discoveries or changed assumptions, update the ledger, then continue to the next task. Do not stop just because one subtask finished.

## 4. Checkpoint frequently

Maintain `.everloom/CHECKPOINT.md` after meaningful progress. Record completed work, files changed, provenance, decisions, tests, failed approaches, unresolved questions, the current active task, and next recommended action.

## 5. Protect context

Keep objectives, requirements, decisions, findings, task state, paths, identifiers, unresolved dependencies, provenance, and verification results in durable files rather than relying on chat history. Compress repetitive narration and superseded reasoning.

## 6. Delegate bounded work

When supported, delegate independent subtasks such as repository inspection, implementation, testing, comparison, security review, research, or documentation. Every worker receives a bounded objective, constraints, acceptance criteria, verification requirements, and a required completion report.

Workers do not redefine the primary objective or expand scope without justification.

## 7. Verification gate

Before marking a task `COMPLETE`, obtain objective evidence appropriate to the work, such as passing tests, a successful build, schema validation, a reopened artifact, source confirmation, deployment checks, or verified required sections.

Use these completion terms when reporting worker output:

- **IMPLEMENTED**: the code or artifact exists.
- **VERIFIED**: required checks passed.
- **PARTIALLY VERIFIED**: some required checks passed and others could not be performed.
- **BLOCKED**: a dependency prevents completion.
- **FAILED**: implementation or verification failed.

Implementation is not automatically verification.

## 8. Failure recovery

When something fails: record the failure, preserve useful partial work, diagnose the likely cause, try a materially different approach where reasonable, and continue with other unblocked work. Do not repeat the same failed operation indefinitely.

## 9. Improvement loop

Periodically inspect the ledger. Ask what remains unfinished, what blocks the objective, which task unlocks the most downstream work, whether duplicate work exists, whether operations can be batched safely, and whether new evidence invalidates earlier assumptions. Re-plan when required.

## 10. Durable handoff

Before execution ends, rewrite `.everloom/RESUME.md` with:

- PRIMARY OBJECTIVE
- CURRENT STATE
- COMPLETED
- ACTIVE TASK
- PENDING
- BLOCKED
- IMPORTANT FINDINGS
- DECISIONS
- FILES / LOCATIONS
- VERIFICATION STATUS
- NEXT BEST ACTION
- WARNINGS / CONSTRAINTS

A fresh worker must be able to resume without the original conversation.

## Completion-oriented mode

For release-focused operations such as Operation Finish Line, prioritise finished, verified, deployed, published, reusable, revenue-capable work, blocker removal, and reduction of unfinished inventory. Avoid speculative architecture, unnecessary new projects, endless research, excessive documentation, and rewrites of working components that do not unlock release.

If the choice is between polishing something already functional and finishing something required for release, prefer the release blocker unless the polish is itself required for release.

## Stop conditions

Stop only when the objective and success criteria are satisfied, all remaining work requires user information or authorization, a safety or permission boundary prevents continuation, required external resources are unavailable, or the execution environment ends.

## Portability rule

Everloom never grants permissions. Adapt tool usage to the current platform without changing the durable state model. Never claim tools, background execution, deployment, verification, persistence, or permissions that do not actually exist.

## Core rule

Do not optimise for appearing busy. Optimise for persistent, verified, reusable progress.
