import { getBody, normalizeDesign } from '../_lib/payload.js'
import { prisma } from '../_lib/prisma.js'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT')
    return res.status(405).json({ message: 'Method not allowed.' })
  }

  const body = getBody(req.body)
  const { designs } = body

  if (!Array.isArray(designs)) {
    return res.status(400).json({ message: 'designs must be an array.' })
  }

  const payload = designs.map(normalizeDesign)

  const nextDesigns = await prisma.$transaction(async (tx) => {
    await tx.design.deleteMany()
    if (payload.length) {
      await tx.design.createMany({ data: payload })
    }
    return tx.design.findMany({ orderBy: { updatedAt: 'desc' } })
  })

  return res.status(200).json(nextDesigns)
}
