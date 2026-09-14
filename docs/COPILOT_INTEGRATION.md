# GitHub Copilot Integration

Everloom treats GitHub Copilot as a bounded implementation worker. Everloom remains responsible for objective continuity, task state, verification, checkpointing, recovery, and cross-agent handoff.

## Operating model

```text
Human
  ↓
Everloom objective + constraints + durable state
  ↓
Bounded worker task
  ↓
GitHub Copilot
  ↓
Implementation
  ↓
Build / test / lint / verification
  ↓
Commit or pull request
  ↓
Everloom checkpoint + resume packet
  ↓
Next task
```

## Activate in a repository

Copy these artifacts into the target repository:

- `EVERLOOM.md`
- `.everloom/`
- `.github/copilot-instructions.md`
- `AGENTS.md` or a repository-specific version based on `templates/AGENTS.md`
- `templates/WORKER_TASK.md`
- optionally `.github/prompts/everloom-worker.prompt.md`

Then edit `.everloom/task.yml` for the project and replace generic repository details in `AGENTS.md`.

## Start a run

Give the orchestrating AI an instruction such as:

> Use EVERLOOM on this repository. Read the durable state, inspect the current repository, then continue the highest-value safe and unblocked work. Use GitHub Copilot as an implementation worker for bounded coding tasks. Verify all worker output before marking tasks complete.

## Assign a bounded Copilot task

Use `templates/WORKER_TASK.md`. Include only the context needed for the task, relevant starting files, explicit constraints, observable acceptance criteria, verification commands, and expected deliverables.

Copilot may inspect nearby implementation context as needed, but it should not redefine the project objective or expand the assignment to unrelated architecture.

## Verify Copilot output

The orchestrator reviews the diff and runs or checks the required verification. Use the status vocabulary in `docs/VERIFICATION_CONTRACT.md`.

If code exists but CI has not run, the correct state is normally `IMPLEMENTED`, not `VERIFIED`.

## Recover from failure

Record failed verification, preserve useful partial work, identify the likely cause, and create a corrective ledger task. If a dependency remains blocked, continue other unblocked work rather than looping indefinitely.

## Hand work to another AI

Update `.everloom/RESUME.md` and the ledger/checkpoint. Another worker should be able to resume from those files plus the repository itself without access to the original chat.

## Operation Finish Line mode

For completion-driven operations, workers should prefer release blockers and shippable outputs over polish or expansion. Prioritise verified releases, deployment/publication readiness, first revenue, and reduction of unfinished inventory. Do not start a new project merely because finishing the current one is inconvenient.
