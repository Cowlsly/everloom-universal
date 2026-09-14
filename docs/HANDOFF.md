# Everloom Cross-Agent Handoff

Everloom work must be transferable between ChatGPT, GitHub Copilot, Grok, and other capable workers without reconstructing the original conversation.

## Required handoff fields

A durable handoff must include:

- project
- primary objective
- measurable success criteria
- current state
- completed work
- verification evidence
- active task
- remaining tasks in priority order
- blockers and authorization boundaries
- important decisions and changed assumptions
- relevant repositories, branches, files, PRs, issues, or artifacts
- commands/tests/checks required for verification
- next recommended action
- warnings and do-not-repeat failures

## Repository-first rule

Critical state belongs in the repository wherever practical. `.everloom/RESUME.md` is the canonical resume packet for the current run. `.everloom/LEDGER.md` records task state, `.everloom/CHECKPOINT.md` records meaningful execution checkpoints, and `.everloom/DISCOVERIES.md` preserves findings that affect later work.

Chat history may provide useful context, but it must not be the only location of decisions, blockers, identifiers, verification results, or the next action.

## Worker return path

A bounded worker should return a structured completion report using `templates/WORKER_TASK.md`. The orchestrating worker then reconciles that result into the ledger, checkpoint, discoveries, and resume packet.

## Conflict handling

When a handoff disagrees with the current repository state, verify the repository and fresh external evidence first. Preserve the discrepancy in durable notes rather than silently choosing whichever version is more convenient.
