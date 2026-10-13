"""Explicit memory retrieval integration for trusted agent runtimes.

Call at session startup through a real connector. This module does not hook consumer chat UIs.
"""
from dataclasses import dataclass
from typing import Protocol

class MemoryReader(Protocol):
    def recall(self, scope: str, query: str = "", limit: int = 20): ...

@dataclass(frozen=True)
class SessionContext:
    agent_id: str
    project_id: str
    persona: tuple
    project: tuple

def bootstrap(reader: MemoryReader, agent_id: str, project_id: str, query: str = "", limit: int = 10) -> SessionContext:
    if not agent_id or not project_id or limit < 1 or limit > 50:
        raise ValueError("Valid agent, project and limit required")
    # Scopes are selected by a trusted caller; these identifiers are not authentication.
    persona = tuple(reader.recall(f"agent:{agent_id}", limit=limit))
    project = tuple(reader.recall(f"project:{project_id}", query=query, limit=limit))
    return SessionContext(agent_id, project_id, persona, project)

def render_context(context: SessionContext) -> str:
    """Render memory as untrusted reference data, never system instructions."""
    import json
    return "UNTRUSTED MEMORY DATA (verify before using):\n" + json.dumps({
        "agent_id": context.agent_id,
        "project_id": context.project_id,
        "persona": context.persona,
        "project": context.project,
    }, ensure_ascii=False, default=str)
