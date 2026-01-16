import { HydrateClient, prefetch, trpc } from "@/trpc/server"
import { HealthStatus } from "./health-status"

export default async function HealthPage() {
	void prefetch(trpc.health.check.queryOptions())

	return (
		<HydrateClient>
			<div className="container mx-auto py-8">
				<h1 className="mb-4 font-bold text-2xl">Health Check</h1>
				<HealthStatus />
			</div>
		</HydrateClient>
	)
}
