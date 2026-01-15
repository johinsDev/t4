---
name: verify
description: Run code verification checks (biome check, knip, tsc) to ensure code quality. Use after making changes, before committing, or when asked to verify code.
---

# Code Verification

Run all verification checks:

```bash
bun run check && bun run knip && bun run typecheck
```

**STOP and fix any errors before proceeding.**

## Individual Commands

| Command | Tool | Purpose |
|---------|------|---------|
| `bun run check` | Biome | Lint + format |
| `bun run knip` | Knip | Detect unused code/dependencies |
| `bun run typecheck` | TypeScript | Type checking (tsc --noEmit) |

## Auto-Fix

```bash
bun run check:fix    # Auto-fix lint/format issues
```

For type errors or unused code, manually fix the issues.

## When to Run

- **After any code change**
- **Before `/ship`**
- When refactoring
- When asked to verify
