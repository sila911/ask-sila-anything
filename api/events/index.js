import { asObject, getBody } from '../_lib/payload.js'
import { prisma } from '../_lib/prisma.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(events)
  }

  if (req.method === 'POST') {
    const body = getBody(req.body)
    const type = String(body.type || '').trim()

    if (!type) {
      return res.status(400).json({ message: 'Event type is required.' })
    }

    await prisma.event.create({
      data: {
        type,
        meta: asObject(body.meta, {}),
      },
    })

    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return res.status(201).json(events)
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ message: 'Method not allowed.' })
}
