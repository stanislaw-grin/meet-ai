'use client'

import { useQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'

export const HomeView = () => {
  const trps = useTRPC()
  const { data } = useQuery(trps.hello.queryOptions({ text: 'Stanislaw' }))

  return <div className="flex flex-col p-4 gap-y-4">{data?.greeting}</div>
}
