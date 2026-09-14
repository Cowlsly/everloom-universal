# EVERLOOM RESUME PACKET

## PRIMARY OBJECTIVE
Make `Cowlsly/everloom-universal` the canonical, generalized Everloom repository with first-class GitHub Copilot worker support while preserving vendor neutrality and durable cross-agent handoff.

## CURRENT STATE
The integration is implemented on branch `everloom/copilot-integration-v1`. Core protocol files, durable state, Copilot instructions, reusable worker templates, verification/handoff documentation, examples, and a validation workflow are being assembled into normal repository files instead of relying on the uploaded ZIP.

## COMPLETED
- Reconstructed the v1.0.0 protocol package from the owner-supplied archive.
- Defined Copilot as a bounded execution backend under Everloom orchestration.
- Added durable project state and verification vocabulary.
- Added native GitHub/Copilot instruction architecture.
- Added bounded worker task, handoff, and validation design.

## ACTIVE TASK
EV-007 — verify the integration branch with GitHub Actions and repair any branch-caused validation failures.

## PENDING
- Observe fresh PR CI.
- Fix any validation defects.
- Merge only after required checks are verified or explicitly waived by the owner.

## BLOCKED
None known before CI runs.

## IMPORTANT FINDINGS
- The dedicated repository originally exposed the package mainly as a ZIP; normal source files are required for agents and CI to use Everloom effectively.
- `New.txt` defines the GitHub Copilot integration goal and the worker/orchestrator boundary.

## DECISIONS
- Everloom remains vendor-neutral.
- Copilot is a worker, not the project objective authority.
- Native `.github/copilot-instructions.md`, `AGENTS.md`, prompt files, PR templates, and GitHub Actions are preferred over custom agent plumbing.
- Verification evidence is required before completion claims.

## FILES / LOCATIONS
- `EVERLOOM.md`
- `UNIVERSAL_PROMPT.txt`
- `.everloom/`
- `.github/copilot-instructions.md`
- `.github/prompts/everloom-worker.prompt.md`
- `.github/workflows/everloom-validate.yml`
- `AGENTS.md`
- `templates/`
- `docs/`
- `scripts/validate_everloom.py`
- `examples/`

## VERIFICATION STATUS
IMPLEMENTED. Fresh GitHub Actions evidence is still required for VERIFIED status.

## NEXT BEST ACTION
Run/review the PR validation workflow, fix any failures caused by this integration, then merge through review.

## WARNINGS / CONSTRAINTS
- Never equate implementation with verification.
- Do not give worker agents authority to silently broaden the project objective.
- Do not expose secrets or perform destructive operations without explicit authorization.
- Critical state must remain in the repository, not only in chat history.
