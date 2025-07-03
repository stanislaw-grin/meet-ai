import { createAgent, openai, TextMessage } from '@inngest/agent-kit'
import { eq, inArray } from 'drizzle-orm'
import JSONL from 'jsonl-parse-stringify'

import { db } from '@/db'
import { agents, meetings, user } from '@/db/schema'
import { StreamTranscriptItem } from '@/modules/meetings/types'

import { inngest } from './client'

const summarizer = createAgent({
  model: openai({ model: 'gpt-4o', apiKey: process.env.OPENAI_API_KEY }),
  name: 'summarizer',
  system:
    `You are an expert meeting summarizer. Your task is to turn transcripts into concise, easy-to-read summaries that highlight the most important insights.

Write in clear, simple language. Focus on readability and usefulness — your summary should be informative for someone who didn’t attend the meeting.

Use the following Markdown format for every output:

#### Overview
Write a clear and engaging narrative summary of the meeting. Focus on the key topics discussed, important workflows, product features, and major takeaways. Use full sentences and a natural tone. Highlight any particularly valuable insights, unique capabilities, or impactful announcements.

#### Notes
Break down the discussion into clearly labeled sections based on themes or topics. For each section, include a timestamp range and summarize the main points in concise bullet points.

#### Example:

[00:00 – 05:30] Introduction & Context
Brief background on the meeting's purpose

Overview of participants and what prompted the session

[05:30 – 12:00] Demo: New Workflow Builder
Live walkthrough of the drag-and-drop automation interface

Notable features: conditional branching, real-time preview

Mention of upcoming Zapier integration

[12:00 – 18:45] Q&A and Feedback
Users asked about custom API support

Team confirmed support is planned for next quarter

Follow-up discussion on performance with large datasets`.trim(),
})

export const meetingsProcessing = inngest.createFunction(
  { id: 'meetings/processing' },
  { event: 'meetings/processing' },
  async ({ event, step }) => {
    const response = await step.run('fetch-transcript', async () => {
      return fetch(event.data.transcriptUrl).then((res) => res.text())
    })

    const transcript = await step.run('parse-transcript', async () => {
      return JSONL.parse<StreamTranscriptItem>(response)
    })

    const transcriptWithSpeakers = await step.run('add-speakers', async () => {
      const speakerIds = [...new Set(transcript.map((item) => item.speaker_id))]

      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds))
        .then((users) =>
          users.map((user) => ({
            ...user,
          }))
        )

      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((agents) =>
          agents.map((agent) => ({
            ...agent,
          }))
        )

      const speakers = [...userSpeakers, ...agentSpeakers]

      return transcript.map((item) => {
        const speaker = speakers.find((speaker) => speaker.id === item.speaker_id)

        return {
          ...item,
          user: {
            name: speaker?.name || 'Unknown',
          },
        }
      })
    })

    const { output } = await summarizer.run(
      'Summarize the following transcript:' + JSON.stringify(transcriptWithSpeakers)
    )

    await step.run('save-summary', async () => {
      await db
        .update(meetings)
        .set({
          summary: (output[0] as TextMessage).content as string,
          status: 'completed',
        })
        .where(eq(meetings.id, event.data.meetingId))
    })
  }
)
