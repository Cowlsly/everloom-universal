# EVERLOOM RESUME PACKET

## PRIMARY OBJECTIVE
Make `Cowlsly/everloom-universal` the canonical, generalized Everloom repository with first-class GitHub Copilot worker support while preserving vendor neutrality and durable cross-agent handoff.

## CURRENT STATE
The v1.1 integration is implemented on branch `everloom/copilot-integration-v1` and proposed in PR #1. Core protocol files, durable state, Copilot instructions, reusable worker templates, verification/handoff documentation, examples, adapters, repository validation, and GitHub Actions are now normal source files in the dedicated repository instead of existing only inside the uploaded ZIP.

## COMPLETED
- Reconstructed the owner-supplied v1.0.0 protocol package into the dedicated repository.
- Defined GitHub Copilot as a bounded execution backend under Everloom orchestration.
- Added `EVERLOOM.md`, `UNIVERSAL_PROMPT.txt`, task schema, adapters, examples, and durable `.everloom/` state.
- Added native GitHub/Copilot instructions, path-specific durable-state instructions, reusable prompt, bounded worker issue form, and PR template.
- Added reusable `AGENTS.md` and worker-task templates.
- Added verification and cross-agent handoff contracts.
- Added `scripts/validate_everloom.py` and `.github/workflows/everloom-validate.yml`.
- Added a realistic bounded Copilot task/completion example.
- Expanded README and changelog for the v1.1 workflow.
- Opened PR #1: `EVERLOOM v1.1: add first-class GitHub Copilot worker integration`.
- GitHub Actions `Everloom Validate` run 34804086374 completed successfully on the initial PR head.

## ACTIVE TASK
Final review/merge of PR #1 after the latest durable-state-only commits receive fresh green CI.

## PENDING
- Confirm the newest PR head is green after this final state update.
- Merge PR #1 when satisfied with review and CI.

## BLOCKED
None known. Merge remains an explicit repository change boundary for the owner/reviewer.

## IMPORTANT FINDINGS
- The dedicated repository originally exposed most of the usable protocol only as an uploaded ZIP; normal source files are required for agents, review, prompts, and CI to use Everloom effectively.
- `New.txt` established the GitHub Copilot integration objective and the worker/orchestrator boundary.
- The first Everloom validation workflow executed successfully, confirming the structure, task manifest schema, resume headings, Copilot verification vocabulary, validator compilation, and merge-marker check on the tested PR head.

## DECISIONS
- Everloom remains vendor-neutral.
- Copilot is a worker, not the project objective authority.
- Native `.github/copilot-instructions.md`, `.github/prompts/`, `.github/instructions/`, `AGENTS.md`, issue/PR templates, and GitHub Actions are preferred over unnecessary custom agent plumbing.
- Verification evidence is required before completion claims.
- Critical state belongs in the repository rather than only in chat history.
- The uploaded v1.0.0 ZIP remains as provenance/archive material; normal repository files are the operational source.

## FILES / LOCATIONS
- `EVERLOOM.md`
- `UNIVERSAL_PROMPT.txt`
- `.everloom/`
- `.github/copilot-instructions.md`
- `.github/instructions/everloom-state.instructions.md`
- `.github/prompts/everloom-worker.prompt.md`
- `.github/ISSUE_TEMPLATE/everloom-worker-task.yml`
- `.github/pull_request_template.md`
- `.github/workflows/everloom-validate.yml`
- `AGENTS.md`
- `templates/`
- `docs/`
- `adapters/`
- `scripts/validate_everloom.py`
- `examples/`
- `README.md`
- `CHANGELOG.md`
- PR #1

## VERIFICATION STATUS
VERIFIED for PR head `8d834536cb381e73b3821a370aceb0739a63e04d` by GitHub Actions run 34804086374. Latest durable-state-only commits require the normal PR workflow to re-run before merge.

## NEXT BEST ACTION
Confirm fresh `Everloom Validate` success on the newest PR head, then merge PR #1 through normal repository review.

## WARNINGS / CONSTRAINTS
- Never equate implementation with verification.
- Do not give worker agents authority to silently broaden the project objective.
- Do not expose secrets or perform destructive operations without explicit authorization.
- Critical state must remain in the repository, not only in chat history.
- Do not claim future merges, releases, deployments, or publications before they actually occur.
