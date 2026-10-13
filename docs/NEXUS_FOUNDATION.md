# EVERLOOM Nexus foundation (experimental)

This branch adds a **local, standard-library-only prototype**, not an autonomous hosted service. Existing EVERLOOM protocol files remain unchanged.

## Run locally

```bash
python -m unittest discover -s tests -p 'test_nexus_engine.py' -v
```

Example Python use:

```python
from nexus.engine import Engine
engine = Engine('nexus.sqlite')
task_id = engine.submit('Check manuscript', {'file': 'draft.txt'})
task = engine.claim('worker-a', lease_seconds=120)
# A worker must actually perform the work and collect evidence before submitting.
engine.submit_result(task_id, 'worker-a', {'issues': 0}, ['verified-test-output'])
engine.review(task_id, 'reviewer-b', True, 'Verified against acceptance criteria')
```

## Implemented contract

- SQLite task ledger and append-only event records
- Atomic task claims with time-bounded worker leases
- Heartbeats, expiry recovery and bounded attempts
- Evidence required before review
- Different named reviewer required before completion
- Failed reviews return to queue until retry budget is exhausted

## Important limitations

- No actual LLM provider integration, background daemon, deployment, UI, dependency graph or model-based evaluation yet.
- Reviewer independence is by supplied worker identifier, not authenticated identity.
- No sandbox, secret isolation, spending controls, migrations or distributed database yet.
- SQLite is intended for one host and a local filesystem, not network filesystem clustering.
- Task result submission is not a guarantee that an external side effect ran exactly once. External integrations will require idempotency keys and reconciliation.
- An expired worker can still have an external side effect in flight; a lease alone cannot prevent it.
- No autonomous approval for paid actions, destructive changes or publication.

## Next milestones

1. Validate tests in CI and inspect results.
2. Add dependency graph, acceptance criteria and review evidence schemas.
3. Add authenticated agent identities, cancellation, attempt fencing and idempotent execution.
4. Implement one sandboxed, budget-limited worker adapter and an independent verifier.
5. Add a supervised background worker service and mobile dashboard.

## EVERLOOM checkpoint

Objective: reliable resumable task execution with independent verification.
Current state: source and tests committed to an isolated development branch; runtime validation is pending until test evidence is obtained.
Status: IMPLEMENTED / NOT YET VERIFIED.
Preservation: do not merge into root without review and tests.
