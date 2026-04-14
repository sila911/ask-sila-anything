import { getBody, normalizeQuestion } from '../_lib/payload.js'
import { prisma } from '../_lib/prisma.js'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT')
    return res.status(405).json({ message: 'Method not allowed.' })
  }

  const body = getBody(req.body)
  const { questions } = body

  if (!Array.isArray(questions)) {
    return res.status(400).json({ message: 'questions must be an array.' })
  }

  const payload = questions.map(normalizeQuestion)

  const nextQuestions = await prisma.$transaction(async (tx) => {
    await tx.question.deleteMany()
    if (payload.length) {
      await tx.question.createMany({ data: payload })
    }
    return tx.question.findMany({ orderBy: { createdAt: 'desc' } })
  })

  return res.status(200).json(nextQuestions)
}
