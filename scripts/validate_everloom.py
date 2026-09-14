#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
import sys

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "EVERLOOM.md",
    "README.md",
    "UNIVERSAL_PROMPT.txt",
    "AGENTS.md",
    ".everloom/task.yml",
    ".everloom/LEDGER.md",
    ".everloom/CHECKPOINT.md",
    ".everloom/DISCOVERIES.md",
    ".everloom/RESUME.md",
    "schemas/task.schema.json",
    ".github/copilot-instructions.md",
    ".github/prompts/everloom-worker.prompt.md",
    "templates/WORKER_TASK.md",
    "templates/AGENTS.md",
    "docs/COPILOT_INTEGRATION.md",
    "docs/VERIFICATION_CONTRACT.md",
    "docs/HANDOFF.md",
]

REQUIRED_RESUME_HEADINGS = [
    "PRIMARY OBJECTIVE",
    "CURRENT STATE",
    "COMPLETED",
    "ACTIVE TASK",
    "PENDING",
    "BLOCKED",
    "IMPORTANT FINDINGS",
    "VERIFICATION STATUS",
    "NEXT BEST ACTION",
    "WARNINGS / CONSTRAINTS",
]


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    missing = [path for path in REQUIRED_FILES if not (ROOT / path).is_file()]
    if missing:
        fail("missing required files: " + ", ".join(missing))

    schema = json.loads((ROOT / "schemas/task.schema.json").read_text(encoding="utf-8"))
    manifest = yaml.safe_load((ROOT / ".everloom/task.yml").read_text(encoding="utf-8"))

    validator = Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(manifest), key=lambda error: list(error.path))
    if errors:
        for error in errors:
            location = ".".join(str(part) for part in error.path) or "<root>"
            print(f"SCHEMA ERROR at {location}: {error.message}", file=sys.stderr)
        raise SystemExit(1)

    resume = (ROOT / ".everloom/RESUME.md").read_text(encoding="utf-8")
    absent_headings = [heading for heading in REQUIRED_RESUME_HEADINGS if heading not in resume]
    if absent_headings:
        fail("RESUME.md is missing required sections: " + ", ".join(absent_headings))

    copilot = (ROOT / ".github/copilot-instructions.md").read_text(encoding="utf-8")
    for term in ["IMPLEMENTED", "VERIFIED", "PARTIALLY VERIFIED", "BLOCKED", "FAILED"]:
        if term not in copilot:
            fail(f"Copilot instructions missing verification state {term}")

    print("Everloom validation passed")
    print(f"Validated {len(REQUIRED_FILES)} required files")
    print("Task manifest matches schemas/task.schema.json")
    print("Resume packet and Copilot verification vocabulary are present")


if __name__ == "__main__":
    main()
