import { Suspense } from 'react'

import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

import { AgentsView, AgentsViewError, AgentsViewLoading } from '@/modules/agents/ui/views/agents-view'
import { getQueryClient, trpc } from '@/trpc/server'

export default function Page() {
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AgentsViewLoading />}>
        <ErrorBoundary fallback={<AgentsViewError />}>
          <AgentsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}
