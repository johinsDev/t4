import { baseProcedure, createTRPCRouter } from "@/trpc/init"
import { pingInputSchema } from "../schemas"

const startTime = Date.now()

export const healthRouter = createTRPCRouter({
	check: baseProcedure.query(() => {
		return {
			status: "ok" as const,
			timestamp: new Date(),
			version: process.env.npm_package_version ?? "0.0.1",
			uptime: Math.floor((Date.now() - startTime) / 1000),
		}
	}),

	ping: baseProcedure.input(pingInputSchema).query(({ input }) => {
		return {
			message: "pong",
			echo: input.echo,
		}
	}),

	log: baseProcedure.input(pingInputSchema).mutation(({ input }) => {
		// biome-ignore lint/suspicious/noConsole: intentional for example mutation
		console.log(`[Health Log] ${input.echo ?? "No message"}`)
		return {
			logged: true,
			timestamp: new Date(),
		}
	}),
})
