'use client'

import { useState } from 'react'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ErrorState } from '@/components/error-state'
import { LoadingState } from '@/components/loading-state'
import { useConfirm } from '@/hooks/use-confirm'
import { MeetingIdViewHeader } from '@/modules/meetings/ui/components/meeting-id-view-header'
import { UpdateMeetingDialog } from '@/modules/meetings/ui/components/update-meeting-dialog'
import { useTRPC } from '@/trpc/client'

interface Props {
  meetingId: string
}

export const MeetingIdView = ({ meetingId }: Props) => {
  const router = useRouter()
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }))
  const queryClient = useQueryClient()

  const [openUpdateMeetingDialog, setOpenUpdateMeetingDialog] = useState(false)

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}))

        router.push('/meetings')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  )

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    'Are you sure?',
    `The following action will remove this meeting.`
  )

  const handleRemoveMeeting = async () => {
    const ok = await confirmRemove()

    if (!ok) return

    await removeMeeting.mutateAsync({ id: meetingId })
  }

  return (
    <>
      <RemoveConfirmation />

      <UpdateMeetingDialog
        open={openUpdateMeetingDialog}
        onOpenChange={setOpenUpdateMeetingDialog}
        initialValues={data}
      />

      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <MeetingIdViewHeader
          meetingId={meetingId}
          meetingName={data.name}
          onEdit={() => setOpenUpdateMeetingDialog(true)}
          onRemove={handleRemoveMeeting}
        />

        <div>{JSON.stringify(data, null, 2)}</div>
      </div>
    </>
  )
}

export const MeetingIdViewLoading = () => {
  return <LoadingState title="Loading Meeting" description="It may take a few seconds..." />
}

export const MeetingIdViewError = () => {
  return <ErrorState title="Error loading Meeting" description="Please try again later" />
}
