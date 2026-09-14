# Everloom Adapter: Security

When the task touches credentials, infrastructure, privacy, or security:

- never expose secrets in logs or durable notes;
- avoid destructive or privilege-escalating actions without explicit authorization;
- prefer reversible changes;
- record security-sensitive assumptions;
- verify access boundaries before acting;
- document rollback steps where practical;
- treat configuration as unverified until runtime or external evidence confirms the intended state.
