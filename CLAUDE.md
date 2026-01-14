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
- **Styling**: Tailwind CSS 4 with CSS variables for theming
- **UI Components**: Shadcn/ui (configured but components added as needed)
- **Icons**: Lucide React
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)
- **Git Hooks**: Lefthook (runs Biome + typecheck on commit, commitlint on commit message)
- **Package Manager**: Bun

## Architecture

### Path Aliases

Import paths use the `@/` alias mapped to the project root:
```typescript
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

### Key Directories

- `app/` - Next.js App Router pages and layouts
- `lib/` - Shared utilities (includes `cn()` for className merging)
- `components/` - React components (Shadcn/ui components go in `components/ui/`)

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
