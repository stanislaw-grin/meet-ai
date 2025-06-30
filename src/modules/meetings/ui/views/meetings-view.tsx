'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { ErrorState } from '@/components/error-state'
import { LoadingState } from '@/components/loading-state'
import { useTRPC } from '@/trpc/client'

export const MeetingsView = () => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({})
  )

  return (
    <div>
      <div>
        { JSON.stringify(data, null, 2) }
      </div>
    </div>
  )
}

export const MeetingsViewLoading = () => {
  return <LoadingState title="Loading Meetings" description="It may take a few seconds..." />
}

export const MeetingsViewError = () => {
  return <ErrorState title="Error loading Meetings" description="Please try again later" />
}
