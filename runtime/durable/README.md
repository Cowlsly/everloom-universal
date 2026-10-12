# Everloom durable runtime

A resumable multi-agent work runtime: task schema, PostgreSQL queue and event store, worker leases and heartbeats, checkpoints, routing and retries, GitHub project discovery and ingestion, and a reproducible Everloom skill packager.

## Where this came from

Moved here on 2026-10-12 from `Cowlsly/cowlsly-working-equest` (a fork of a third-party workflow framework), so that fork can be deleted:

- PR #1 `cowlsly-durable-workflow` — durable long-running workflow foundation
- PR #2 `cowlsly-durable-selfhost` — names and packages it as Everloom (includes all of PR #1)

All 47 commits on those branches were authored by Cowlsly and only add new files; nothing here imports or modifies the upstream framework. Paths are kept as they were (`src/core/durable_*.py`, `tests/`, `migrations/`, `scripts/`, `skills/everloom/`, `.cowlsly/`).

## Licence

These files were written inside an AGPL-3.0 repository, so this folder keeps that licence (`LICENSE` here) for now. The rest of everloom-universal is Apache-2.0. Because Cowlsly is the sole author, the owner can choose to relicense this folder to Apache-2.0 by replacing this `LICENSE` file; that is an owner decision and has not been made.

## Status

- CI: `.github/workflows/durable-runtime.yml` runs the tests and builds/validates the skill package.
- In the source fork, workflow run 63 passed on the packaging revision.
- A live PostgreSQL/Neon deployment remains external and untested. No secrets are included.

```bash
cd runtime/durable
python -m pip install pytest==9.1.1 httpx==0.28.1
python -m pytest -q tests
```
