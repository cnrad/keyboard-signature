import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

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

    // Generate SVG instead of using canvas
    const strokeStyle = signature.stroke_config.style === 'gradient' 
      ? `url(#gradient)` 
      : signature.stroke_config.color;

    const gradientDef = signature.stroke_config.style === 'gradient' 
      ? `<defs>
           <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" style="stop-color:${signature.stroke_config.gradientStart};stop-opacity:1" />
             <stop offset="100%" style="stop-color:${signature.stroke_config.gradientEnd};stop-opacity:1" />
           </linearGradient>
         </defs>` 
      : '';

    const svg = `<svg width="650" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="650" height="${height}" fill="#000000"/>
      ${gradientDef}
      <path d="${signature.signature_path}" 
            stroke="${strokeStyle}" 
            stroke-width="${signature.stroke_config.width}" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            fill="none"/>
    </svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(svg);

  } catch (error) {
    console.error('Error generating signature image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
