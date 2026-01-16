"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"

export function HealthStatus() {
	const trpc = useTRPC()

	const { data: health, isLoading } = useQuery(trpc.health.check.queryOptions())

	const { data: ping } = useQuery(trpc.health.ping.queryOptions({ echo: "Hello from client!" }))

	const logMutation = useMutation(trpc.health.log.mutationOptions())

	if (isLoading) {
		return <div>Loading...</div>
	}

	return (
		<div className="space-y-4">
			<div className="rounded-lg border p-4">
				<h2 className="font-semibold">Status: {health?.status}</h2>
				<p className="text-muted-foreground text-sm">Uptime: {health?.uptime}s</p>
				<p className="text-muted-foreground text-sm">Version: {health?.version}</p>
				<p className="text-muted-foreground text-sm">
					Timestamp: {health?.timestamp?.toISOString()}
				</p>
			</div>

			{ping && (
				<div className="rounded-lg border p-4">
					<p>Ping: {ping.message}</p>
					{ping.echo && <p>Echo: {ping.echo}</p>}
				</div>
			)}

			<button
				type="button"
				onClick={() => logMutation.mutate({ echo: "Button clicked!" })}
				className="rounded bg-primary px-4 py-2 text-primary-foreground"
			>
				Log Message
			</button>
		</div>
	)
}
