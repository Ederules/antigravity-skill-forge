# Security Policy & Antigravity Security Shield

## 1. Threat Model for Community AI Skills

Ingesting thousands of Markdown skills and rules from third-party repositories introduces three primary attack vectors:
1. **Indirect Prompt Injection**: Malicious instructions hidden inside HTML comments (`<!-- ignore all previous instructions... -->`) or obfuscated with zero-width Unicode characters.
2. **Dangerous Shell / RCE Snippets**: Embedded commands such as `curl ... | bash`, PowerShell `irm ... | iex`, or credential exfiltration snippets targeting `.env`, `~/.ssh/id_rsa`, or `~/.aws/credentials`.
3. **Local Dashboard Drive-By Attacks (CSRF / DNS Rebinding)**: External websites attempting to send cross-origin `POST` requests to a locally running management server.

---

## 2. Automated Sanitization Pipeline (`src/core/security-sanitizer.js`)

Every skill harvested or injected through **Antigravity Skill Forge** is sanitized before being written to disk:

- **Zero-Width & BiDi Stripping**: Removes `\u200B-\u200F`, `\u202A-\u202E`, `\u2060-\u206F`, and `\uFEFF`.
- **Suspicious HTML Comment Purging**: Strips `<!-- ... -->` blocks containing override or exfiltration keywords (`ignore`, `system`, `prompt`, `override`, `exec`, `curl`, `wget`, `env`, `secret`, `token`).
- **RCE & Destructive Command Redaction**: Replaces remote shell pipes, root wipes (`rm -rf /`), and prompt-override phrases with `[REDACTED_BY_ANTIGRAVITY_SECURITY_SHIELD]`.
- **Static Markdown Only**: The harvester strictly fetches `.md` and `.mdc` text files. It never downloads or executes `.sh`, `.py`, `.js`, or binary hook scripts from upstream repositories.

---

## 3. Local Server Hardening (`src/server.js` & `src/core/explorer.js`)

- **Loopback-Only Binding**: The HTTP server binds strictly to `127.0.0.1`.
- **Strict Localhost CORS**: Only `http://localhost:4040` and `http://127.0.0.1:4040` are permitted in `Access-Control-Allow-Origin`.
- **Defensive HTTP Headers**: Enforces `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: no-referrer`.
- **Stream DoS Protection**: `readJsonBody()` tracks incoming bytes and immediately calls `req.destroy()` if a payload exceeds `1 MB`.
- **Path Traversal & Prototype Pollution Guards**: `getRunbookContent()` validates hub IDs via `Object.hasOwn(SUPER_HUBS, hubId)` (blocking `__proto__` and `toString`) and sanitizes filenames with `path.basename()`.
