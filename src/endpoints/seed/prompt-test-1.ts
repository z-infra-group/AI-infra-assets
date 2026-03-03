import type { RequiredDataFromCollectionSlug } from 'payload'

export type PromptTestArgs = {
  prompt: any
  author: any
}

export const promptTest1: (args: PromptTestArgs) => RequiredDataFromCollectionSlug<'prompt-tests'> = ({
  prompt,
  author,
}) => ({
  title: 'Test: Creative Writing - Story Opening',
  description: 'Testing the creative writing assistant with a sci-fi story opening task',
  prompt: prompt.id,
  author: author.id,
  inputVariables: {
    genre: 'science fiction',
    tone: 'mysterious',
    setting: 'Neo-Tokyo',
  },
  expectedOutput: 'A compelling science fiction story opening set in Neo-Tokyo with mysterious elements and good atmosphere',
  actualOutput: 'The neon lights of Neo-Tokyo flickered as Detective Kael stepped out of the hovercar, rain slicking his trench coat. Something felt wrong about this district—the shadows seemed deeper here, whispering secrets that made even the streetlights hesitate before illuminating the alleyways.',
  testConfig: {
    temperature: 0.8,
    max_tokens: 500,
  },
  modelUnderTest: 'gpt-4',
  executionStatus: 'completed',
  executedAt: new Date(),
  executionTime: 2340,
  tokensUsed: 387,
  cost: 0.0234,
  score: 85,
  feedback: 'Excellent story opening with strong atmosphere and setting establishment. The imagery of neon lights and shadows creates the right mood. Could benefit from more character development in the opening.',
  isVerified: true,
  _status: 'published',
})
