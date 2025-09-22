// Hex to OKLab
export function hexToOklab(hex: string) {
  // Hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // sRGB to linear RGB
  const toLinear = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  // RGB to XYZ (D65)
  const x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750;
  const z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041;

  // XYZ to OKLab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  return [L, a, b2];
}

// OKLab to Hex
export function oklabToHex([L, a, b]) {
  // OKLab to XYZ
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const x = 1.2270138511 * l - 0.5577999807 * m + 0.2812561490 * s;
  const y = -0.0405801784 * l + 1.1122568696 * m - 0.0716766787 * s;
  const z = -0.0763812845 * l - 0.4214819784 * m + 1.5861632204 * s;

  // XYZ to linear RGB
  let lr = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  let lg = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
  let lb = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

  // Linear RGB to sRGB
  const toSrgb = c => c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  const r = Math.max(0, Math.min(1, toSrgb(lr)));
  const g = Math.max(0, Math.min(1, toSrgb(lg)));
  const b2 = Math.max(0, Math.min(1, toSrgb(lb)));

  // RGB to Hex
  const toHex = n => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b2)}`;
}

// Generate smooth gradient stops using OKLab
export function generateSmoothGradient(startHex: string, endHex: string, numStops = 6) {
  const start = hexToOklab(startHex);
  const end = hexToOklab(endHex);
  const colors = [];

  for (let i = 0; i < numStops; i++) {
    const t = i / (numStops - 1);

    // Linear interpolation in OKLab space
    const L = start[0] + (end[0] - start[0]) * t;
    const a = start[1] + (end[1] - start[1]) * t;
    const b = start[2] + (end[2] - start[2]) * t;

    const hex = oklabToHex([L, a, b]);
    colors.push({ hex, position: Math.round(t * 100) });
  }

  return colors;
}

// Convert gradient stops to SVG linearGradient string
export function generateSVGGradient(startHex: string, endHex: string, numStops = 6) {
  const stops = generateSmoothGradient(startHex, endHex, numStops);
  return <>
    {stops
      .map(stop => <stop
        key={stop.hex}
        offset={`${stop.position}%`}
        stopColor={stop.hex}
        stopOpacity={1}
      />)}
  </>;
}
