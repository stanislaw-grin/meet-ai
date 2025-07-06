'use client'

import { useState } from 'react'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { ErrorState } from '@/components/error-state'
import { LoadingState } from '@/components/loading-state'
import { useConfirm } from '@/hooks/use-confirm'
import { MeetingStatus } from '@/modules/meetings/types'
import { ActiveState } from '@/modules/meetings/ui/components/active-state'
import { CanceledState } from '@/modules/meetings/ui/components/canceled-state'
import { CompletedState } from '@/modules/meetings/ui/components/completed-state'
import { MeetingIdViewHeader } from '@/modules/meetings/ui/components/meeting-id-view-header'
import { ProcessingState } from '@/modules/meetings/ui/components/processing-state'
import { UpcomingState } from '@/modules/meetings/ui/components/upcoming-state'
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
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}))
        await queryClient.invalidateQueries(trpc.premium.getFreeUsage.queryOptions())

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

  const cancelMeeting = useMutation(
    trpc.meetings.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}))

        if (meetingId) {
          await queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id: meetingId }))
        }

        toast.success('Meeting canceled successfully.')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  )

  const handleCancelMeeting = async () => {
    cancelMeeting.mutate({ ...data, status: MeetingStatus.Canceled })
  }

  const isActive = data.status === MeetingStatus.Active
  const isUpcoming = data.status === MeetingStatus.Upcoming
  const isCanceled = data.status === MeetingStatus.Canceled
  const isCompleted = data.status === MeetingStatus.Completed
  const isProcessing = data.status === MeetingStatus.Processing

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

        {isCanceled && <CanceledState/>}
        {isProcessing && <ProcessingState/> }
        {isUpcoming && (
          <UpcomingState
            meetingId={meetingId}
            onCancelMeeting={handleCancelMeeting}
            isCanceling={cancelMeeting.isPending}
          />
        )}
        {isActive && <ActiveState meetingId={meetingId} />}
        {isCompleted && <CompletedState data={ data }/>}
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
