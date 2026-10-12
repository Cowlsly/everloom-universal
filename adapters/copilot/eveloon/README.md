# Eveloon — GitHub Copilot skill

The Eveloon persona skill for GitHub Copilot. Moved here on 2026-10-12 from `Cowlsly/eveloon-copilot-skill` so Everloom has one public home. (`Cowlsly/evelyn-copilot-skill` was a name-swapped copy and is not kept.)

## Install

Project skill (shared with a repository):

```bash
mkdir -p .github/skills/eveloon
cp adapters/copilot/eveloon/SKILL.md .github/skills/eveloon/SKILL.md
```

Personal skill (all your repositories):

```bash
mkdir -p ~/.copilot/skills/eveloon
cp adapters/copilot/eveloon/SKILL.md ~/.copilot/skills/eveloon/SKILL.md
```

Then say "Eveloon" to Copilot, or ask for help uploading scripts, packaging files, or writing skills.

For Everloom's own Copilot worker integration, see `docs/COPILOT_INTEGRATION.md`.
