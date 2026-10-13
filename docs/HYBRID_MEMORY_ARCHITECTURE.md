# EVERLOOM Memory Nexus: hybrid design checkpoint

Status: **IMPLEMENTED IN PART / TESTS NOT YET VERIFIED**. No PostgreSQL server, chat integration, or automatic sync has been deployed.

## Data flow

1. A trusted, authenticated agent runtime selects authorized user, agent and project scopes.
2. At session start, the runtime calls `nexus.session.bootstrap` through an authorized memory adapter.
3. Retrieved records are treated as **untrusted reference data**, not privileged instructions.
4. A local SQLite database stores offline memory; `nexus.backup.snapshot` creates consistent SQLite snapshots.
5. A future sync worker sends approved changes over TLS to a PostgreSQL service, using revision checks and idempotency keys.
6. The central service enforces authentication, tenant isolation, least privilege and audit trails.
7. Deletions propagate through tombstones, with a documented retention and backup purge policy.

## Security rules

- Never commit real memory databases, connection strings, tokens, or private chat logs.
- Never expose PostgreSQL directly to untrusted mobile clients. Use an authenticated API.
- PostgreSQL RLS is defense-in-depth, not a substitute for authorization.
- SQLite files and SD-card backups are **not encrypted by default**. Encrypt before storing sensitive data.
- User-controlled scopes are not authentication. Bind scope to verified user/agent identity on the server.
- Do not silently ingest full chats or personal data. Require authorization and minimization.
- Treat remembered personality as preferences, never higher-priority instructions.
- No automatic paid provisioning or publication.

## Planned integration

- `nexus.session`: local reader interface and explicit bootstrap.
- `nexus/postgres_schema.sql`: draft tenant-isolated central schema.
- Next: authenticated API, append-only change journal, conflict policy, retention enforcement, and encrypted sync.
- Then: opt-in adapters for compatible agent runtimes, with startup and shutdown hooks.

## Validation

```bash
python -m unittest discover -s tests -p 'test_nexus_*.py' -v
```

Tests are source-level until executed in a runtime. The PostgreSQL SQL must be checked against a real PostgreSQL test instance before deployment.
