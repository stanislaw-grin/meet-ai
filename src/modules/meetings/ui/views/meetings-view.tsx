'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { DataPagination } from '@/components/data-pagination'
import { DataTable } from '@/components/data-table'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { LoadingState } from '@/components/loading-state'
import { useMeetingsFilters } from '@/modules/meetings/hooks/use-meetings-filters'
import { columns } from '@/modules/meetings/ui/components/columns'
import { useTRPC } from '@/trpc/client'

export const MeetingsView = () => {
  const router = useRouter()
  const [filters, setFilters] = useMeetingsFilters()
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
    })
  )

  const isAnyFilterModified = !!filters.status || !!filters.search || !!filters.agentId

  return (
    <div className="flex-1 pb-4 md:px-8 flex flex-col gap-y-4">
      <DataTable data={data.items} columns={columns} onRowClick={row => router.push(`/meetings/${row.id}`)} />
      <DataPagination page={filters.page} totalPages={data.totalPages} onPageChange={(page) => setFilters({ page })} />

      {!isAnyFilterModified && data.items.length === 0 && (
        <EmptyState
          title="Create your first meeting"
          description="Schedule a meeting to connect with others. Each meeting lets you collaborate, share ideas and interact with participants in real time."
        />
      )}
    </div>
  )
}

export const MeetingsViewLoading = () => {
  return <LoadingState title="Loading Meetings" description="It may take a few seconds..." />
}

export const MeetingsViewError = () => {
  return <ErrorState title="Error loading Meetings" description="Please try again later" />
}
