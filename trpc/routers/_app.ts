import { healthRouter } from "@/features/health"
import { createTRPCRouter } from "../init"

export const appRouter = createTRPCRouter({
	health: healthRouter,
})

export type AppRouter = typeof appRouter
