'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { DataPagination } from '@/components/data-pagination'
import { DataTable } from '@/components/data-table'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { LoadingState } from '@/components/loading-state'
import { useAgentsFilters } from '@/modules/agents/hooks/use-agents-filters'
import { columns } from '@/modules/agents/ui/components/columns'
import { useTRPC } from '@/trpc/client'

export const AgentsView = () => {
  const [filters, setFilters] = useAgentsFilters()

  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions({ ...filters }))

  const router = useRouter()

  return (
    <div className="flex flex-col flex-1 pb-4 px-4 md:px-8 gap-y-4">
      <DataTable columns={columns} data={data.items} onRowClick={ ({ id }) => router.push(`/agents/${id}`) } />
      <DataPagination page={filters.page} totalPages={data.totalPages} onPageChange={(page) => setFilters({ page })} />

      {data.items.length === 0 && (
        <EmptyState
          title="Create your first agent"
          description="Create an agent to join your meetings. Each agent will follow your instructions and can interact with participants during the call"
        />
      )}
    </div>
  )
}

export const AgentsViewLoading = () => {
  return <LoadingState title="Loading Agents" description="It may take a few seconds..." />
}

export const AgentsViewError = () => {
  return <ErrorState title="Error loading Agents" description="Please try again later" />
}
