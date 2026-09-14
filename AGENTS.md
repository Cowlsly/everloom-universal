# AGENTS.md

## Project objective
Maintain Everloom Universal as a vendor-neutral durable work protocol that lets capable AI workers make verified progress across long-running projects without relying on conversational memory.

## Architecture summary
- `EVERLOOM.md`: canonical protocol.
- `.everloom/`: durable project state for this repository.
- `schemas/`: machine-readable task manifest schema.
- `templates/`: reusable repository/worker artifacts.
- `docs/`: integration and verification guidance.
- `examples/`: realistic usage examples.
- `.github/`: GitHub/Copilot-native integration and CI.
- `scripts/validate_everloom.py`: repository validator used by CI.

## Canonical rules
- Everloom orchestrates durable state and verification.
- Coding agents, including GitHub Copilot, are bounded workers.
- Do not silently broaden objectives or create parallel implementations when existing work can be finished.
- Implementation is not verification.
- Keep critical state in repository files.

## Validation
Run:

```bash
python -m pip install pyyaml jsonschema
python scripts/validate_everloom.py
```

The GitHub Actions workflow `.github/workflows/everloom-validate.yml` runs the same structural and schema checks.

## Files not to modify casually
- `EVERLOOM.md`
- `schemas/task.schema.json`
- `.everloom/task.yml`
- verification vocabulary and handoff contracts

Protocol changes should preserve backward compatibility where practical and update the README/changelog when user-facing behaviour changes.

## Definition of done
A change is done only when its acceptance criteria are met, relevant validation passes, documentation reflects behavioural changes, blockers are explicit, and durable state is sufficient for another worker to resume.
