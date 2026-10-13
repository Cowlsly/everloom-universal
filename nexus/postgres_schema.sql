-- EVERLOOM Memory Nexus: draft central schema, not yet deployed.
-- Use an application-specific non-owner role with no BYPASSRLS privilege.
-- Authentication must set app.user_id transaction-locally from verified identity.
-- Never accept user_id directly from untrusted agent input.
CREATE TABLE IF NOT EXISTS nexus_memories (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL,
 scope text NOT NULL,
 kind text NOT NULL,
 body text NOT NULL,
 source text NOT NULL,
 confidence text NOT NULL CHECK (confidence IN ('verified','user-stated','unverified')),
 revision bigint NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz,
 deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS nexus_memories_active_scope
 ON nexus_memories(user_id,scope,updated_at DESC)
 WHERE deleted_at IS NULL;
ALTER TABLE nexus_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_memories FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nexus_memories_tenant ON nexus_memories;
CREATE POLICY nexus_memories_tenant ON nexus_memories
 USING (user_id = nullif(current_setting('app.user_id', true),'')::uuid)
 WITH CHECK (user_id = nullif(current_setting('app.user_id', true),'')::uuid);
-- Production requires tightly controlled role grants, audit, TLS, migrations,
-- authentication, key management, backups, and sync conflict resolution.
