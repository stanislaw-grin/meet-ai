import { ReactNode } from 'react'

import { CircleXIcon, CircleCheckIcon, ClockArrowUpIcon, VideoIcon, LoaderIcon } from 'lucide-react'

import { CommandSelect } from '@/components/command-select'
import { useMeetingsFilters } from '@/modules/meetings/hooks/use-meetings-filters'
import { MeetingStatus } from '@/modules/meetings/types'

const StatusOptionWrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
  <div className="flex items-center gap-x-2 capitalize">{children}</div>
)

const options = [
  {
    id: MeetingStatus.Upcoming,
    value: MeetingStatus.Upcoming,
    children: (
      <StatusOptionWrapper>
        <ClockArrowUpIcon />
        {MeetingStatus.Upcoming}
      </StatusOptionWrapper>
    ),
  },
  {
    id: MeetingStatus.Completed,
    value: MeetingStatus.Completed,
    children: (
      <StatusOptionWrapper>
        <CircleCheckIcon />
        {MeetingStatus.Completed}
      </StatusOptionWrapper>
    ),
  },
  {
    id: MeetingStatus.Active,
    value: MeetingStatus.Active,
    children: (
      <StatusOptionWrapper>
        <VideoIcon />
        {MeetingStatus.Active}
      </StatusOptionWrapper>
    ),
  },
  {
    id: MeetingStatus.Processing,
    value: MeetingStatus.Processing,
    children: (
      <StatusOptionWrapper>
        <LoaderIcon />
        {MeetingStatus.Processing}
      </StatusOptionWrapper>
    ),
  },
  {
    id: MeetingStatus.Canceled,
    value: MeetingStatus.Canceled,
    children: (
      <StatusOptionWrapper>
        <CircleXIcon />
        {MeetingStatus.Canceled}
      </StatusOptionWrapper>
    ),
  },
]

export const StatusFilter = () => {
  const [filters, setFilters] = useMeetingsFilters()

  return (
    <CommandSelect
      placeholder="Status"
      className="h-9"
      options={options}
      onSelect={(value) => setFilters({ status: value as MeetingStatus })}
      value={ filters.status ?? '' }
    />
  )
}
