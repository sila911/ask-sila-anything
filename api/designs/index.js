import { prisma } from '../_lib/prisma.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method not allowed.' })
  }

  const designs = await prisma.design.findMany({
    orderBy: { updatedAt: 'desc' },
  })

  return res.status(200).json(designs)
}
