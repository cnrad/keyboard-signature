import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name } = req.query

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Invalid signature name' })
    }

    // Sanitize name input
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim()
    if (!sanitizedName) {
      return res.status(400).json({ error: 'Invalid signature name' })
    }

    const supabase = await createServerSupabaseClient(req, res)

    const { data, error } = await supabase
      .from('claimed_signatures')
      .select('*')
      .eq('name', sanitizedName.toUpperCase())
      .limit(1)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching signature:', error)
      return res.status(500).json({ error: 'Failed to fetch signature' })
    }

    if (!data) {
      return res.status(404).json({ error: 'Signature not found' })
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching signature:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
