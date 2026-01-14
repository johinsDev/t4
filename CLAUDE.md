# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Workflow Rule

**After completing any code change requested by the user, ALWAYS run:**

```bash
bun run sync "type: description"
```

This command will: stash changes → pull with rebase → restore changes → commit → push.

Choose the appropriate commit type (`feat`, `fix`, `refactor`, etc.) based on the change made.

## Build & Development Commands

```bash
bun install         # Install dependencies (also installs git hooks via lefthook)
bun run dev         # Start development server with Turbopack (localhost:3000)
bun run build       # Production build
bun run start       # Start production server
```

## Code Quality Commands

```bash
bun run check       # Run Biome linting + formatting check
bun run check:fix   # Auto-fix lint and format issues
bun run lint        # Run Biome linter only
bun run format      # Run Biome formatter only
bun run typecheck   # Run TypeScript type checking (tsc --noEmit)
bun run knip        # Find unused exports, dependencies, and files
bun run sync "msg"  # Stash, pull --rebase, commit, push (full git workflow)
```

No test framework is currently configured.

## Tech Stack

- **Framework**: Next.js 16.1.1 with App Router (React 19)
- **Language**: TypeScript (strict mode)
- **API**: tRPC (end-to-end typesafe API)
- **Database**: Drizzle ORM
- **Validation**: Zod
- **Styling**: Tailwind CSS 4 with CSS variables for theming
- **UI Components**: Shadcn/ui (configured but components added as needed)
- **Icons**: Lucide React
- **State**: Zustand (client state)
- **Background Jobs**: Trigger.dev
- **Realtime**: PartyKit (future)
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)
- **Git Hooks**: Lefthook (runs Biome + typecheck on commit, commitlint on commit message)
- **Package Manager**: Bun

## Architecture

> **Full architecture documentation**: See `.claude/skills/architect.md`

This project uses **feature-based architecture**. Each feature is self-contained with server (router, service, repository) and client (components, hooks, store) code.

### Path Aliases

```typescript
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UserCard, type User } from "@/features/users"
```

### Key Directories

- `app/` - Next.js App Router (routes only, minimal logic)
- `features/` - Feature modules (THE CORE - see architect skill)
- `components/` - Shared UI components
- `lib/` - Shared utilities
- `trpc/` - tRPC setup
- `trigger/` - Background jobs

### Feature Structure

```
src/features/<name>/
├── server/           # Router, service, repository
├── schemas/          # Zod schemas (source of truth)
├── components/       # Feature components
├── hooks/            # Feature hooks
├── store/            # Zustand store (if needed)
└── index.ts          # Public API barrel export
```

### Import Rules

```typescript
// ✅ Import from feature barrel
import { UserCard, type User } from "@/features/users"

// ❌ Never deep import into another feature
import { UserCard } from "@/features/users/components/user-card"
```

### Styling Pattern

Uses `cn()` utility from `lib/utils.ts` to merge Tailwind classes:
```typescript
import { cn } from "@/lib/utils"
cn("base-classes", conditional && "conditional-class", className)
```

Biome is configured to sort Tailwind classes in `cn()`, `clsx()`, and `cva()` calls.

### Theming

Dark mode is supported via CSS variables defined in `app/globals.css`. The color system uses oklch color space with variables for primary, secondary, destructive, and other semantic colors.

## Code Style (Biome)

- Tabs for indentation
- Double quotes for strings
- No semicolons (except where required)
- Trailing commas in ES5 contexts
- `Array<T>` syntax preferred over `T[]`
- `import type` for type-only imports

## Commit Messages

Uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint:

```
type(scope?): subject

body?
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Examples:
- `feat: add user authentication`
- `fix(api): handle null response`
- `docs: update README`
