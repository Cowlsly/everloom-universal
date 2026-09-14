# Everloom Universal

Everloom is a vendor-neutral durable work protocol for long, multi-step tasks across repositories, folders, research projects, documentation work, investigations, migrations, and other complex workflows.

Its purpose is simple: preserve verified progress across AI runs, prevent repeated rediscovery, and leave every project in a state another worker can resume immediately.

## Core idea

The project supplies the mission. Everloom supplies the durable execution loop:

1. Establish objective, state, constraints, dependencies, outputs, and authorization boundaries.
2. Maintain a task ledger with evidence-based status.
3. Execute the highest-value unblocked work.
4. Save useful output immediately.
5. Verify before marking complete.
6. Record failures and changed assumptions.
7. Checkpoint meaningful progress.
8. Finish each run with a self-contained resume packet.

## GitHub Copilot support

GitHub Copilot is supported as a bounded implementation worker. Everloom remains the orchestration, continuity, verification, checkpointing, recovery, and handoff layer.

Native integration lives in:

- `.github/copilot-instructions.md`
- `.github/prompts/everloom-worker.prompt.md`
- `AGENTS.md`
- `templates/WORKER_TASK.md`
- `docs/COPILOT_INTEGRATION.md`
- `docs/VERIFICATION_CONTRACT.md`
- `docs/HANDOFF.md`
- `.github/workflows/everloom-validate.yml`

## Quick start

Copy these into a target repository:

- `EVERLOOM.md`
- `.everloom/`
- `AGENTS.md` or a tailored copy of `templates/AGENTS.md`
- `.github/copilot-instructions.md` when using GitHub Copilot
- `templates/WORKER_TASK.md` when delegating bounded implementation work

Then edit `.everloom/task.yml` for the project.

Give the orchestrating AI this instruction:

> Read `EVERLOOM.md`, `.everloom/task.yml`, and `.everloom/RESUME.md`. Follow Everloom strictly. Continue the highest-value safe and unblocked work. Use bounded workers where useful. Verify worker output before marking tasks complete, and leave a self-contained resume packet before the run ends.

## Suggested invocation

```text
EVERLOOM <repository-or-folder> <task>
```

Examples:

```text
EVERLOOM ./ Finish the highest-priority unfinished implementation work.
```

```text
EVERLOOM Cowlsly/Twin-Shell Audit memory architecture, consolidate duplicate services, test changes, and document blockers.
```

```text
Use EVERLOOM on this repository and use GitHub Copilot as an implementation worker.
```

## Portable state directory

```text
.everloom/
├── task.yml
├── LEDGER.md
├── CHECKPOINT.md
├── DISCOVERIES.md
└── RESUME.md
```

## Verification vocabulary

Everloom distinguishes:

- **IMPLEMENTED** — artifact or code exists.
- **VERIFIED** — required checks passed.
- **PARTIALLY VERIFIED** — some checks passed, others could not be performed.
- **BLOCKED** — a dependency or authorization boundary prevents completion.
- **FAILED** — implementation or verification failed.

“Code was written” is not the same as “task verified.” See `docs/VERIFICATION_CONTRACT.md`.

## Validation

For this repository:

```bash
python -m pip install pyyaml jsonschema
python scripts/validate_everloom.py
```

GitHub Actions runs the same checks on pull requests and pushes to `root`.

## Cross-agent handoff

Everloom is designed so work can move between ChatGPT, GitHub Copilot, Grok, and other capable agents. Critical project state belongs in the repository, especially `.everloom/RESUME.md`, rather than depending on the original chat history.

See `docs/HANDOFF.md`.

## Completion-oriented mode

Everloom also supports release-focused operations such as Operation Finish Line. In this mode, prioritise finished, verified, deployed, published, reusable, and revenue-capable work, plus blocker removal and reduction of unfinished inventory. Avoid unnecessary new projects, speculative architecture, endless alternatives, and polish that does not unlock shipping.

## Safety and permissions

Everloom never grants permissions by itself. Workers must not:

- bypass access controls,
- exfiltrate secrets,
- perform destructive actions without authorization,
- claim background execution they cannot actually perform,
- claim deployment or verification without evidence,
- silently broaden the project objective.

## Repository status

The original uploaded v1.0.0 ZIP remains as provenance/archive material. The normal repository files are the operational source for agents, review, and CI.

## License

See `LICENSE`.
