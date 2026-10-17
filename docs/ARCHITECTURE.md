# Architecture: Progressive Disclosure & Token Budget Engineering

## 1. The Customization Token Budget Ceiling

Google Antigravity enforces a strict **20,000-token budget** across all global customizations (`Rules`, `Skills`, `Subagents`, and `MCP Tools`), alongside a **24,000-byte limit** per individual `SKILL.md` file.

When skills are installed using a traditional flat structure (`~/.gemini/config/skills/<skill-name>/SKILL.md`), Antigravity loads the YAML frontmatter (`name` and `description`) of every skill into the global system prompt on every turn. At ~130 skills, token usage exceeds 100%, triggering automatic truncation.

## 2. Two-Tier Hierarchical Super-Hubs

**Antigravity Skill Forge** decouples **Skill Discovery** from **Runbook Execution**:

1. **Tier 1 — The 10 Master Super-Hubs (`SKILL.md`)**:
   - Only 10 top-level domain hubs are registered in `~/.gemini/config/skills/hub-*`.
   - Each hub's `SKILL.md` is strictly capped at **15 featured highlights** plus a direct pointer to `./references/INDEX.md`, keeping every `SKILL.md` between **1.3 KB and 2.4 KB** (10x below the 24 KB truncation limit).
   - Total system prompt token footprint remains fixed at **~2,506 tokens (12.5%)**, regardless of whether 500 or 5,000 runbooks are stored inside `references/`.

2. **Tier 2 — On-Demand Reference Runbooks (`references/*.md`)**:
   - All 2,530+ specialized community skills are normalized, sanitized, and classified into their corresponding Super-Hub's `references/` directory.
   - `references/INDEX.md` provides a complete alphabetical catalog for each domain.
   - When a user prompt activates a domain hub, Antigravity inspects `references/INDEX.md` and loads only the exact runbook needed via `view_file`.

## 3. Implicit Trigger Synthesis (`src/core/adapter.js`)

Most community prompts (`.cursorrules`, ChatGPT system prompts, `CLAUDE.md` files) are written in conversational second-person (`"You are an expert React developer..."`) without explicit activation clauses.

`adaptToAntigravity()` automatically:
1. Converts conversational prefixes into third-person capabilities (`"Provides capabilities as..."`).
2. Scans the body for technology and workflow keywords (`react`, `postgres`, `kubernetes`, `owasp`, `playwright`, etc.).
3. Synthesizes an explicit `Use when developing, reviewing, or debugging with ...` trigger clause required by Gemini's tool-selection router.
4. Normalizes platform-specific file references (`CLAUDE.md`, `.cursorrules`, `.windsurfrules` → `AGENTS.md`).
