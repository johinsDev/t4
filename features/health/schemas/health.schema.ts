import { z } from "zod"

export const healthCheckSchema = z.object({
	status: z.enum(["ok", "degraded", "error"]),
	timestamp: z.date(),
	version: z.string(),
	uptime: z.number(),
})

export const pingSchema = z.object({
	message: z.string(),
	echo: z.string().optional(),
})

export const pingInputSchema = z.object({
	echo: z.string().optional(),
})

export type HealthCheck = z.infer<typeof healthCheckSchema>
export type Ping = z.infer<typeof pingSchema>
export type PingInput = z.infer<typeof pingInputSchema>
