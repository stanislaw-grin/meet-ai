import { z } from 'zod'

import { MeetingStatus } from '@/modules/meetings/types'

export const meetingsInsertSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  agentId: z.string().min(1, { message: 'Agent is required' }),
})

export const meetingsUpdateSchema = meetingsInsertSchema.extend({
  id: z.string().min(1, { message: 'ID is required' }),
  status: z
    .enum([
      MeetingStatus.Upcoming,
      MeetingStatus.Active,
      MeetingStatus.Completed,
      MeetingStatus.Processing,
      MeetingStatus.Canceled,
    ])
    .optional()
})
