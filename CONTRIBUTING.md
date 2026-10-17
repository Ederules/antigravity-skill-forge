# Contributing to Antigravity Skill Forge

Thank you for helping make **Antigravity Skill Forge** the ultimate open-source skill ecosystem for Google Antigravity!

## How to Add a New Upstream Skill Repository

1. Open [`src/core/mass-harvester.js`](./src/core/mass-harvester.js).
2. Add your repository entry to the `sources` list in `harvestExtendedCommunityRepos()`:
   ```javascript
   { repo: 'owner/repository-name', prefix: 'shortprefix', limit: 300 }
   ```
3. Map the new prefix to a human-readable source badge in [`src/core/explorer.js`](./src/core/explorer.js).
4. Run the test suite to verify zero regressions and full security sanitization:
   ```bash
   npm test
   ```
5. Submit a Pull Request!

## Engineering Standards

- **Zero External Dependencies**: Keep the runtime 100% native Node.js (`node:fs`, `node:http`, `node:path`, `node:test`).
- **Security First**: All ingested content must pass through `sanitizeSkillContent()` in [`src/core/security-sanitizer.js`](./src/core/security-sanitizer.js).
- **Token Discipline**: Never allow any generated `SKILL.md` to exceed `4 KB`. Full lists of runbooks must always be written to `references/INDEX.md`.
