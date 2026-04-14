import {
  getBody,
  normalizeDesign,
  normalizeEvent,
  normalizeQuestion,
} from '../_lib/payload.js'
import { prisma } from '../_lib/prisma.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed.' })
  }

  const body = getBody(req.body)
  const { questions, designs, events, force = false } = body

  if (!Array.isArray(questions) || !Array.isArray(designs) || !Array.isArray(events)) {
    return res.status(400).json({ message: 'questions, designs, and events must be arrays.' })
  }

  const [questionCount, designCount, eventCount] = await Promise.all([
    prisma.question.count(),
    prisma.design.count(),
    prisma.event.count(),
  ])

  const existingCounts = {
    questions: questionCount,
    designs: designCount,
    events: eventCount,
  }

  const hasExistingData = questionCount > 0 || designCount > 0 || eventCount > 0

  if (hasExistingData && !force) {
    return res.status(200).json({
      imported: false,
      skipped: true,
      reason: 'database_not_empty',
      existingCounts,
    })
  }

  const questionPayload = questions.map(normalizeQuestion)
  const designPayload = designs.map(normalizeDesign)
  const eventPayload = events.map(normalizeEvent)

  const createdCounts = await prisma.$transaction(async (tx) => {
    if (force && hasExistingData) {
      await tx.event.deleteMany()
      await tx.design.deleteMany()
      await tx.question.deleteMany()
    }

    const [questionsResult, designsResult, eventsResult] = await Promise.all([
      questionPayload.length
        ? tx.question.createMany({ data: questionPayload, skipDuplicates: true })
        : Promise.resolve({ count: 0 }),
      designPayload.length
        ? tx.design.createMany({ data: designPayload, skipDuplicates: true })
        : Promise.resolve({ count: 0 }),
      eventPayload.length
        ? tx.event.createMany({ data: eventPayload, skipDuplicates: true })
        : Promise.resolve({ count: 0 }),
    ])

    return {
      questions: questionsResult.count,
      designs: designsResult.count,
      events: eventsResult.count,
    }
  })

  return res.status(201).json({
    imported: true,
    createdCounts,
    existingCounts,
  })
}
