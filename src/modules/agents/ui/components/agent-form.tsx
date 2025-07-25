import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { GeneratedAvatar } from '@/components/generated-avatar'
import { Button } from '@/components/ui/button'
import { Form, FormMessage, FormLabel, FormItem, FormField, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { agentsInsertSchema } from '@/modules/agents/schemas'
import { AgentGetOne } from '@/modules/agents/types'
import { useTRPC } from '@/trpc/client'

interface AgentFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialValues?: AgentGetOne
}

export const AgentForm = ({ onSuccess, onCancel, initialValues }: AgentFormProps) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}))
        await queryClient.invalidateQueries(trpc.premium.getFreeUsage.queryOptions())

        toast.success('Agent created successfully.')

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

  const updateAgent = useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}))

        if (initialValues?.id) {
          await queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({ id: initialValues.id }))
        }

        toast.success('Agent updated successfully.')

        if (onSuccess) {
          onSuccess()
        }
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  )

  const form = useForm<z.infer<typeof agentsInsertSchema>>({
    resolver: zodResolver(agentsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      instructions: initialValues?.instructions ?? '',
    },
  })

  const isEdit = !!initialValues?.id
  const isPending = createAgent.isPending || updateAgent.isPending

  const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
    if (isEdit) {
      updateAgent.mutate({ ...values, id: initialValues.id })
    } else {
      createAgent.mutate(values)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <GeneratedAvatar seed={form.watch('name')} variant="botttsNeutral" className="border size-16" />

        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="instructions"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="You are a helpful assistant that can answer questions and help with assignments."
                />
              </FormControl>
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
  )
}
