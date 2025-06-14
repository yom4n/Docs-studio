import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { apiKey } = req.body
    if (!apiKey) {
      throw new Error('API key is required')
    }

    // TODO: Implement actual API key validation with Cerebras API
    if (apiKey.trim()) {
      return res.status(200).json({ valid: true })
    }

    throw new Error('Invalid API key')
  } catch (error) {
    console.error('API key validation error:', error)
    return res.status(400).json({ error: 'Invalid API key' })
  }
}
