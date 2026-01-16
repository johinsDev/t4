import "server-only"

import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import type { TRPCQueryOptions } from "@trpc/tanstack-react-query"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { cache } from "react"
import { createTRPCContext } from "./init"
import { makeQueryClient } from "./query-client"
import { appRouter } from "./routers/_app"

export const getQueryClient = cache(makeQueryClient)

export const trpc = createTRPCOptionsProxy({
	ctx: createTRPCContext,
	router: appRouter,
	queryClient: getQueryClient,
})

export const caller = appRouter.createCaller(createTRPCContext)

// biome-ignore lint/suspicious/noExplicitAny: TRPCQueryOptions requires any for flexibility
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
	const queryClient = getQueryClient()
	// biome-ignore lint/suspicious/noExplicitAny: queryKey type is dynamic
	if ((queryOptions.queryKey[1] as any)?.type === "infinite") {
		// biome-ignore lint/suspicious/noExplicitAny: infinite query type casting
		void queryClient.prefetchInfiniteQuery(queryOptions as any)
	} else {
		void queryClient.prefetchQuery(queryOptions)
	}
}

export function HydrateClient(props: { children: React.ReactNode }) {
	const queryClient = getQueryClient()
	return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>
}
