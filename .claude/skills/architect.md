---
name: architect
description: Run full architecture validation and ensure feature-based structure compliance. Use after major changes, before PRs, or when asked to verify architecture.
---

# Architecture Validation

Run all checks including feature boundary validation:

```bash
bun run check && bun run typecheck && bun run knip
```

## What This Checks

1. **Biome** (`bun run check`) - Linting and formatting
2. **TypeScript** (`bun run typecheck`) - Type checking without emitting files
3. **Knip** (`bun run knip`) - Unused code and dependency detection

---

# Project Architecture

## Directory Structure Overview

```
src/
├── app/                    # Next.js App Router (routes only, minimal logic)
├── components/             # Shared UI components (buttons, inputs, etc.)
├── config/                 # App configuration and constants
├── features/               # Feature modules (THE CORE)
├── hooks/                  # Shared React hooks
├── lib/                    # Shared utilities and helpers
├── trpc/                   # tRPC client and server setup
└── trigger/                # Trigger.dev background jobs
```

---

# Feature-Based Architecture

## Core Principle

**Everything related to a domain lives together in a feature folder.**

Features are self-contained modules that encapsulate:
- Server logic (tRPC routers, services, repositories)
- Client logic (components, hooks, stores)
- Shared types and schemas

## Feature Structure

```
src/features/<feature-name>/
│
├── server/                     # SERVER-SIDE (runs on server only)
│   ├── <name>.router.ts        # tRPC router definition
│   ├── <name>.service.ts       # Business logic layer
│   ├── <name>.repository.ts    # Data access layer (Drizzle queries)
│   └── index.ts                # Server barrel export
│
├── schemas/                    # SHARED (server + client)
│   ├── <name>.schema.ts        # Zod schemas for validation
│   └── index.ts                # Schemas barrel export
│
├── components/                 # CLIENT-SIDE components
│   ├── <name>-list.tsx
│   ├── <name>-card.tsx
│   ├── <name>-form.tsx
│   └── index.ts                # Components barrel export
│
├── hooks/                      # CLIENT-SIDE hooks
│   ├── use-<name>.ts           # Custom hooks for this feature
│   └── index.ts                # Hooks barrel export
│
├── store/                      # CLIENT-SIDE state (if needed)
│   ├── <name>.store.ts         # Zustand store
│   └── index.ts                # Store barrel export
│
├── types/                      # TypeScript types (inferred from schemas when possible)
│   ├── <name>.types.ts
│   └── index.ts                # Types barrel export
│
└── index.ts                    # PUBLIC API - Main barrel export
```

---

# Server-Side Patterns

## 1. Router (tRPC)

Routes define the API endpoints. Keep them thin - delegate to services.

```typescript
// src/features/users/server/users.router.ts
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/trpc/server"
import { usersService } from "./users.service"
import { createUserSchema, updateUserSchema, userIdSchema } from "../schemas"

export const usersRouter = createTRPCRouter({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return usersService.list(ctx.db)
    }),

  byId: protectedProcedure
    .input(userIdSchema)
    .query(async ({ ctx, input }) => {
      return usersService.byId(ctx.db, input.id)
    }),

  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      return usersService.create(ctx.db, input)
    }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      return usersService.update(ctx.db, input.id, input.data)
    }),

  delete: protectedProcedure
    .input(userIdSchema)
    .mutation(async ({ ctx, input }) => {
      return usersService.delete(ctx.db, input.id)
    }),
})
```

## 2. Service (Business Logic)

Services contain business logic. They orchestrate repositories and handle complex operations.

```typescript
// src/features/users/server/users.service.ts
import type { DB } from "@/lib/db"
import type { CreateUser, UpdateUser } from "../schemas"
import { usersRepository } from "./users.repository"

export const usersService = {
  async list(db: DB) {
    return usersRepository.findAll(db)
  },

  async byId(db: DB, id: string) {
    const user = await usersRepository.findById(db, id)
    if (!user) {
      throw new Error("User not found")
    }
    return user
  },

  async create(db: DB, data: CreateUser) {
    // Business logic here (validation, transformations, etc.)
    return usersRepository.create(db, {
      ...data,
      createdAt: new Date(),
    })
  },

  async update(db: DB, id: string, data: UpdateUser) {
    await this.byId(db, id) // Ensure exists
    return usersRepository.update(db, id, data)
  },

  async delete(db: DB, id: string) {
    await this.byId(db, id) // Ensure exists
    return usersRepository.delete(db, id)
  },
}
```

## 3. Repository (Data Access)

Repositories handle database queries. They use Drizzle ORM.

```typescript
// src/features/users/server/users.repository.ts
import { eq } from "drizzle-orm"
import type { DB } from "@/lib/db"
import { users } from "@/lib/db/schema"
import type { CreateUser, UpdateUser } from "../schemas"

export const usersRepository = {
  async findAll(db: DB) {
    return db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    })
  },

  async findById(db: DB, id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    })
  },

  async findByEmail(db: DB, email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    })
  },

  async create(db: DB, data: CreateUser) {
    const [user] = await db.insert(users).values(data).returning()
    return user
  },

  async update(db: DB, id: string, data: UpdateUser) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return user
  },

  async delete(db: DB, id: string) {
    await db.delete(users).where(eq(users.id, id))
  },
}
```

---

# Schema Patterns (Zod)

Schemas are the source of truth for validation. Types are inferred from them.

```typescript
// src/features/users/schemas/users.schema.ts
import { z } from "zod"

// Base schema (matches DB columns)
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(["admin", "user", "guest"]),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
})

// Input schemas (for mutations)
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateUserSchema = z.object({
  id: userSchema.shape.id,
  data: createUserSchema.partial(),
})

export const userIdSchema = z.object({
  id: userSchema.shape.id,
})

// Inferred types
export type User = z.infer<typeof userSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
```

---

# Client-Side Patterns

## 1. Using tRPC Hooks

```typescript
// In a component
import { trpc } from "@/trpc/client"

export function UserList() {
  const { data: users, isLoading } = trpc.users.list.useQuery()
  const createUser = trpc.users.create.useMutation()

  // ...
}
```

## 2. Zustand Store (for client state)

```typescript
// src/features/filters/store/filters.store.ts
import { create } from "zustand"

interface FiltersState {
  search: string
  status: string | null
  setSearch: (search: string) => void
  setStatus: (status: string | null) => void
  reset: () => void
}

export const useFiltersStore = create<FiltersState>((set) => ({
  search: "",
  status: null,
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  reset: () => set({ search: "", status: null }),
}))
```

## 3. Feature Components

```typescript
// src/features/users/components/user-card.tsx
import type { User } from "../schemas"

interface UserCardProps {
  user: User
  onEdit?: () => void
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{user.name}</h3>
      <p className="text-muted-foreground text-sm">{user.email}</p>
    </div>
  )
}
```

---

# Feature Barrel Exports

## Public API (index.ts)

Each feature exposes a clean public API through its barrel export:

```typescript
// src/features/users/index.ts

// Server (only import in server contexts)
export { usersRouter } from "./server"

// Schemas and types (shared)
export {
  userSchema,
  createUserSchema,
  updateUserSchema,
  type User,
  type CreateUser,
  type UpdateUser,
} from "./schemas"

// Components (client)
export { UserCard, UserList, UserForm } from "./components"

// Hooks (client)
export { useUserActions } from "./hooks"

// Store (client)
export { useUsersStore } from "./store"
```

## Import Rules

### ✅ CORRECT - Import from feature barrel

```typescript
import { UserCard, type User } from "@/features/users"
import { useFiltersStore } from "@/features/filters"
import { createUserSchema } from "@/features/users"
```

### ❌ VIOLATION - Deep imports into another feature

```typescript
import { UserCard } from "@/features/users/components/user-card"
import { usersRepository } from "@/features/users/server/users.repository"
import { useFiltersStore } from "@/features/filters/store/filters.store"
```

### ✅ EXCEPTION - Deep imports within the same feature are OK

```typescript
// Inside src/features/users/server/users.service.ts
import { usersRepository } from "./users.repository" // ✅ Same feature
```

---

# tRPC Setup

## Root Router

```typescript
// src/trpc/routers/_app.ts
import { createTRPCRouter } from "../server"
import { usersRouter } from "@/features/users"
import { postsRouter } from "@/features/posts"
import { authRouter } from "@/features/auth"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  posts: postsRouter,
})

export type AppRouter = typeof appRouter
```

---

# Background Jobs (Trigger.dev)

For background processing, use Trigger.dev:

```typescript
// src/trigger/jobs/send-welcome-email.ts
import { task } from "@trigger.dev/sdk/v3"
import { emailService } from "@/features/notifications/server"

export const sendWelcomeEmail = task({
  id: "send-welcome-email",
  run: async (payload: { userId: string; email: string }) => {
    await emailService.sendWelcome(payload.email)
    return { success: true }
  },
})
```

---

# Future Integrations

## Notifications (Email/SMS)

Will follow a class-based pattern similar to Laravel:

```typescript
// src/features/notifications/server/notifications/welcome.notification.ts
export class WelcomeNotification extends Notification {
  constructor(private user: User) {
    super()
  }

  via() {
    return ["email", "database"]
  }

  toEmail() {
    return new EmailMessage()
      .subject("Welcome!")
      .template("welcome", { name: this.user.name })
  }

  toDatabase() {
    return {
      title: "Welcome to the platform",
      body: "Get started by...",
    }
  }
}
```

## Realtime (PartyKit)

For realtime features, PartyKit will be integrated:

```typescript
// src/partykit/rooms/document.ts
// Collaborative document editing, presence, etc.
```

---

# Checklist for New Features

When creating a new feature:

- [ ] Create feature folder: `src/features/<name>/`
- [ ] Create schemas with Zod: `schemas/<name>.schema.ts`
- [ ] Create repository: `server/<name>.repository.ts`
- [ ] Create service: `server/<name>.service.ts`
- [ ] Create router: `server/<name>.router.ts`
- [ ] Add router to root: `src/trpc/routers/_app.ts`
- [ ] Create components (if needed): `components/`
- [ ] Create hooks (if needed): `hooks/`
- [ ] Create store (if needed): `store/`
- [ ] Export public API: `index.ts`
- [ ] Run architecture validation: `bun run check && bun run typecheck && bun run knip`
