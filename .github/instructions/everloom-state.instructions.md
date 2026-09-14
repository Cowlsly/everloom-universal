---
applyTo: ".everloom/**"
---

# Durable Everloom state instructions

Files under `.everloom/` are operational project state, not decorative documentation.

When editing them:

- preserve established objective, constraints, identifiers, decisions, and verification evidence unless fresh repository evidence justifies a change;
- never erase unresolved blockers merely to simplify the file;
- distinguish implementation from verification;
- keep task states consistent with the ledger;
- record material changed assumptions in `DISCOVERIES.md`;
- update `RESUME.md` so a fresh worker can resume without chat history;
- do not store secrets, credentials, tokens, private keys, or sensitive runtime values.

Do not mark work complete without objective evidence.
