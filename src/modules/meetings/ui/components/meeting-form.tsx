import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { CommandSelect } from '@/components/command-select'
import { GeneratedAvatar } from '@/components/generated-avatar'
import { Button } from '@/components/ui/button'
import { Form, FormMessage, FormLabel, FormItem, FormField, FormControl, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { NewAgentDialog } from '@/modules/agents/ui/components/new-agent-dialog'
import { meetingsInsertSchema } from '@/modules/meetings/schemas'
import { MeetingGetOne } from '@/modules/meetings/types'
import { useTRPC } from '@/trpc/client'

interface MeetingFormProps {
  onSuccess?: (id?: string) => void
  onCancel?: () => void
  initialValues?: MeetingGetOne
}

export const MeetingForm = ({ onSuccess, onCancel, initialValues }: MeetingFormProps) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false)
  const [agentsSearch, setAgentsSearch] = useState('')

  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      pageSize: 100,
      search: agentsSearch,
    })
  )

  const createMeeting = useMutation(
    trpc.meetings.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}))
        await queryClient.invalidateQueries(trpc.premium.getFreeUsage.queryOptions())

        toast.success('Meeting created successfully.')

        if (onSuccess) {
          onSuccess(data.id)
        }
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  )

  const updateMeeting = useMutation(
    trpc.meetings.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}))

        if (initialValues?.id) {
          await queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id: initialValues.id }))
        }

        toast.success('Meeting updated successfully.')

        if (onSuccess) {
          onSuccess()
        }
      },
      onError: (error) => {
        toast.error(error.message)

        if (error.data?.code === 'FORBIDDEN') {
          router.push('/upgrade')
        }
      },
    })
  )

  const form = useForm<z.infer<typeof meetingsInsertSchema>>({
    resolver: zodResolver(meetingsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      agentId: initialValues?.agentId ?? '',
    },
  })

  const isEdit = !!initialValues?.id
  const isPending = createMeeting.isPending || updateMeeting.isPending

  const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
    if (isEdit) {
      updateMeeting.mutate({ ...values, id: initialValues.id })
    } else {
      createMeeting.mutate(values)
    }
  }

  return (
    <>
      <NewAgentDialog open={openNewAgentDialog} onOpenChange={setOpenNewAgentDialog} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Onboarding Call" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="agentId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent</FormLabel>
                <FormControl>
                  <CommandSelect
                    onSelect={field.onChange}
                    onSearch={setAgentsSearch}
                    value={field.value}
                    placeholder="Select an Agent"
                    isLoading={agents.isPending}
                    options={(agents.data?.items ?? []).map((agent) => ({
                      id: agent.id,
                      value: agent.id,
                      children: (
                        <div className="flex items-center gap-x-2">
                          <GeneratedAvatar seed={agent.name} variant="botttsNeutral" className="border size-6" />
                          <span>{agent.name}</span>
                        </div>
                      ),
                    }))}
                  />
                </FormControl>

                <FormDescription>
                  Not found what you&apos;re looking for?{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setOpenNewAgentDialog(true)}
                  >
                    Create new one
                  </button>
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-x-2">
            {onCancel && (
              <Button variant="ghost" type="button" disabled={isPending} onClick={onCancel}>
                Cancel
              </Button>
            )}

            <Button type="submit" disabled={isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
