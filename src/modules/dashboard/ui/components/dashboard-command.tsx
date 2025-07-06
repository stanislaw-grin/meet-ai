'use client'

import { Dispatch, SetStateAction, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { GeneratedAvatar } from '@/components/generated-avatar'
import {
  CommandResponsiveDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
  CommandSeparator,
} from '@/components/ui/command'
import { useTRPC } from '@/trpc/client'

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const DashboardCommand = ({ open, setOpen }: Props) => {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const trpc = useTRPC()

  const meetings = useQuery(
    trpc.meetings.getMany.queryOptions({
      search,
      pageSize: 100,
    }),
  )

  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      search,
      pageSize: 100,
    }),
  )

  return (
    <CommandResponsiveDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Find a meeting or agent..." value={search} onValueChange={setSearch} />

      <CommandList>
        <CommandEmpty>
          <span className="text-muted-foreground text-sm">No results found</span>
        </CommandEmpty>

        <CommandGroup heading="Meetings">
          {meetings.data?.items.map((meeting) => (
            <CommandItem
              key={meeting.id}
              onSelect={() => {
                router.push(`/meetings/${meeting.id}`)
                setOpen(false)
              }}
            >
              {meeting.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Agents">
          {agents.data?.items.map((agent) => (
            <CommandItem
              key={agent.id}
              onSelect={() => {
                router.push(`/agents/${agent.id}`)
                setOpen(false)
              }}
            >
              <GeneratedAvatar seed={agent.name} variant="botttsNeutral" className="size-5" />
              {agent.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandResponsiveDialog>
  )
}
