import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { createCanvas } from 'canvas';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid signature name' });
  }

  try {
    const { data: signature, error } = await supabase
      .from('claimed_signatures')
      .select('*')
      .eq('name', name.toUpperCase())
      .single();

    if (error || !signature) {
      return res.status(404).json({ error: 'Signature not found' });
    }

    const height = signature.include_numbers ? 260 : 200;
    const canvas = createCanvas(650, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 650, height);

    // Configure stroke
    ctx.lineWidth = signature.stroke_config.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Set stroke style
    if (signature.stroke_config.style === 'solid') {
      ctx.strokeStyle = signature.stroke_config.color;
    } else if (signature.stroke_config.style === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, 650, 0);
      gradient.addColorStop(0, signature.stroke_config.gradientStart);
      gradient.addColorStop(1, signature.stroke_config.gradientEnd);
      ctx.strokeStyle = gradient;
    }

    // Draw signature path
    const path = new Path2D(signature.signature_path);
    ctx.stroke(path);

    const buffer = canvas.toBuffer('image/png');

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.send(buffer);

  } catch (error) {
    console.error('Error generating signature image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
