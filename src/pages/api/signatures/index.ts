import { NextApiRequest, NextApiResponse } from 'next'
import { createServiceSupabaseClient } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Use service role client for database operations
    const serviceClient = createServiceSupabaseClient()

    const { data, error } = await serviceClient
      .from('claimed_signatures')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching signatures:', error)
      return res.status(500).json({ error: 'Failed to fetch signatures' })
    }

    return res.status(200).json(data || [])
  } catch (error) {
    console.error('Error fetching signatures:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
