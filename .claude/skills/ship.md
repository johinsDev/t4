---
name: ship
description: Ship changes to remote - verify, commit, sync, and push. Runs /verify automatically, then commits and pushes changes.
---

# Ship Changes

**verify → commit → sync → push**

## Instructions

### 1. Run Verification (MANDATORY)

```bash
bun run check && bun run knip && bun run typecheck
```

**If any check fails, STOP and fix issues before continuing.**

### 2. Check for Changes

```bash
git status --porcelain
```

If no changes, inform user and stop.

### 3. Get Current Branch

```bash
git branch --show-current
```

### 4. Stash → Sync → Pop

```bash
# Stash current changes
git stash push -m "ship-temp-stash"

# Check if remote exists and sync
git remote get-url origin 2>/dev/null && git pull --rebase origin <branch>

# Restore changes
git stash pop
```

If rebase conflicts:
```bash
git rebase --abort
git stash pop
```
Then inform user to resolve manually.

### 5. Stage All Changes

```bash
git add -A
```

### 6. Analyze & Commit

```bash
git diff --cached --stat
git diff --cached
```

Create commit using conventional commits:

| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code restructuring |
| `perf` | Performance |
| `test` | Tests |
| `build` | Build system |
| `ci` | CI config |
| `chore` | Maintenance |

```bash
git commit -m "$(cat <<'EOF'
type(scope): description

Body if needed.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 7. Push

```bash
# Push (set upstream if needed)
git push -u origin <branch>
```

If push fails:
```bash
git pull --rebase origin <branch>
git push origin <branch>
```

### 8. Confirm

```bash
git log -1 --oneline
git status
```

## Error Handling

| Error | Action |
|-------|--------|
| Verification fails | STOP, fix issues, run again |
| Rebase conflicts | Abort, pop stash, inform user |
| Push fails | Pull --rebase, push again |
| No remote | Skip push, inform user |

## Quick Reference

```
1. bun run check && bun run knip && bun run typecheck
2. git stash → pull --rebase → stash pop
3. git add -A → commit (conventional)
4. git push
```
