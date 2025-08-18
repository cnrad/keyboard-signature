export type Key = {
  x: number;
  y: number;
};
export enum KeyboardLayout {
  QWERTY = "qwerty",
  COLEMAK = "colemak",
  DVORAK = "dvorak",
  AZERTY = "azerty",
  ABCDEF = "abcdef",
}

export const numberRow: Record<string, Key> = {
  "1": { x: 0.5, y: -1 },
  "2": { x: 1.5, y: -1 },
  "3": { x: 2.5, y: -1 },
  "4": { x: 3.5, y: -1 },
  "5": { x: 4.5, y: -1 },
  "6": { x: 5.5, y: -1 },
  "7": { x: 6.5, y: -1 },
  "8": { x: 7.5, y: -1 },
  "9": { x: 8.5, y: -1 },
  "0": { x: 9.5, y: -1 },
};

export const keyboardLayouts: Record<KeyboardLayout, Record<string, Key>> = {
  [KeyboardLayout.QWERTY]: {
    Q: { x: 0.5, y: 0 },
    W: { x: 1.5, y: 0 },
    E: { x: 2.5, y: 0 },
    R: { x: 3.5, y: 0 },
    T: { x: 4.5, y: 0 },
    Y: { x: 5.5, y: 0 },
    U: { x: 6.5, y: 0 },
    I: { x: 7.5, y: 0 },
    O: { x: 8.5, y: 0 },
    P: { x: 9.5, y: 0 },

    A: { x: 0.75, y: 1 },
    S: { x: 1.75, y: 1 },
    D: { x: 2.75, y: 1 },
    F: { x: 3.75, y: 1 },
    G: { x: 4.75, y: 1 },
    H: { x: 5.75, y: 1 },
    J: { x: 6.75, y: 1 },
    K: { x: 7.75, y: 1 },
    L: { x: 8.75, y: 1 },

    Z: { x: 1.25, y: 2 },
    X: { x: 2.25, y: 2 },
    C: { x: 3.25, y: 2 },
    V: { x: 4.25, y: 2 },
    B: { x: 5.25, y: 2 },
    N: { x: 6.25, y: 2 },
    M: { x: 7.25, y: 2 },
  },

  [KeyboardLayout.COLEMAK]: {
    Q: { x: 0.5, y: 0 },
    W: { x: 1.5, y: 0 },
    F: { x: 2.5, y: 0 },
    P: { x: 3.5, y: 0 },
    G: { x: 4.5, y: 0 },
    J: { x: 5.5, y: 0 },
    L: { x: 6.5, y: 0 },
    U: { x: 7.5, y: 0 },
    Y: { x: 8.5, y: 0 },

    A: { x: 0.75, y: 1 },
    R: { x: 1.75, y: 1 },
    S: { x: 2.75, y: 1 },
    T: { x: 3.75, y: 1 },
    D: { x: 4.75, y: 1 },
    H: { x: 5.75, y: 1 },
    N: { x: 6.75, y: 1 },
    E: { x: 7.75, y: 1 },
    I: { x: 8.75, y: 1 },
    O: { x: 9.75, y: 1 },

    Z: { x: 1.25, y: 2 },
    X: { x: 2.25, y: 2 },
    C: { x: 3.25, y: 2 },
    V: { x: 4.25, y: 2 },
    B: { x: 5.25, y: 2 },
    K: { x: 6.25, y: 2 },
    M: { x: 7.25, y: 2 },
  },

  [KeyboardLayout.DVORAK]: {
    "'": { x: 0.5, y: 0 },
    ",": { x: 1.5, y: 0 },
    ".": { x: 2.5, y: 0 },
    P: { x: 3.5, y: 0 },
    Y: { x: 4.5, y: 0 },
    F: { x: 5.5, y: 0 },
    G: { x: 6.5, y: 0 },
    C: { x: 7.5, y: 0 },
    R: { x: 8.5, y: 0 },
    L: { x: 9.5, y: 0 },

    A: { x: 0.75, y: 1 },
    O: { x: 1.75, y: 1 },
    E: { x: 2.75, y: 1 },
    U: { x: 3.75, y: 1 },
    I: { x: 4.75, y: 1 },
    D: { x: 5.75, y: 1 },
    H: { x: 6.75, y: 1 },
    T: { x: 7.75, y: 1 },
    N: { x: 8.75, y: 1 },
    S: { x: 9.75, y: 1 },

    ";": { x: 1.25, y: 2 },
    Q: { x: 2.25, y: 2 },
    J: { x: 3.25, y: 2 },
    K: { x: 4.25, y: 2 },
    X: { x: 5.25, y: 2 },
    B: { x: 6.25, y: 2 },
    M: { x: 7.25, y: 2 },
    W: { x: 8.25, y: 2 },
    V: { x: 9.25, y: 2 },
    Z: { x: 10.25, y: 2 },
  },

  [KeyboardLayout.AZERTY]: {
    A: { x: 0.5, y: 0 },
    Z: { x: 1.5, y: 0 },
    E: { x: 2.5, y: 0 },
    R: { x: 3.5, y: 0 },
    T: { x: 4.5, y: 0 },
    Y: { x: 5.5, y: 0 },
    U: { x: 6.5, y: 0 },
    I: { x: 7.5, y: 0 },
    O: { x: 8.5, y: 0 },
    P: { x: 9.5, y: 0 },

    Q: { x: 0.75, y: 1 },
    S: { x: 1.75, y: 1 },
    D: { x: 2.75, y: 1 },
    F: { x: 3.75, y: 1 },
    G: { x: 4.75, y: 1 },
    H: { x: 5.75, y: 1 },
    J: { x: 6.75, y: 1 },
    K: { x: 7.75, y: 1 },
    L: { x: 8.75, y: 1 },
    M: { x: 9.75, y: 1 },

    W: { x: 1.25, y: 2 },
    X: { x: 2.25, y: 2 },
    C: { x: 3.25, y: 2 },
    V: { x: 4.25, y: 2 },
    B: { x: 5.25, y: 2 },
    N: { x: 6.25, y: 2 },
  },
  [KeyboardLayout.ABCDEF]: {
    A: { x: 0.5, y: 0 },
    B: { x: 1.5, y: 0 },
    C: { x: 2.5, y: 0 },
    D: { x: 3.5, y: 0 },
    E: { x: 4.5, y: 0 },
    F: { x: 5.5, y: 0 },
    G: { x: 6.5, y: 0 },
    H: { x: 7.5, y: 0 },
    I: { x: 8.5, y: 0 },
    J: { x: 9.5, y: 0 },
    K: { x: 0.75, y: 1 },
    L: { x: 1.75, y: 1 },
    M: { x: 2.75, y: 1 },
    N: { x: 3.75, y: 1 },
    O: { x: 4.75, y: 1 },
    P: { x: 5.75, y: 1 },
    Q: { x: 6.75, y: 1 },
    R: { x: 7.75, y: 1 },
    S: { x: 8.75, y: 1 },
    T: { x: 1.25, y: 2 },
    U: { x: 2.25, y: 2 },
    V: { x: 3.25, y: 2 },
    W: { x: 4.25, y: 2 },
    X: { x: 5.25, y: 2 },
    Y: { x: 6.25, y: 2 },
    Z: { x: 7.25, y: 2 },
  },
} as const;

export const getKeyboardLayout = (layout: KeyboardLayout, includeNumbers: boolean): Record<string, Key> => {
  const baseLayout = keyboardLayouts[layout];
  return includeNumbers ? { ...numberRow, ...baseLayout } : baseLayout;
};

export type CurveType =
  | "linear"
  | "catmull-rom"
  | "quadratic-bezier"
  | "cubic-bezier"
  | "simple-curve";

export enum StrokeStyle {
  SOLID = "solid",
  GRADIENT = "gradient",
}

export type StrokeConfig = {
  style: StrokeStyle;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  width: number;
};

export const generateLinearPath = (
  points: { x: number; y: number }[],
): string => {
  if (points.length === 0) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  return path;
};

export const generateCatmullRomPath = (
  points: { x: number; y: number }[],
): string => {
  if (points.length < 2) return "";
  if (points.length === 2)
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i === 0 ? points[0] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 =
      i === points.length - 2 ? points[points.length - 1] : points[i + 2];

    const tension = 0.5;

    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 6;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 6;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 6;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

export const generateQuadraticBezierPath = (
  points: { x: number; y: number }[],
): string => {
  if (points.length < 2) return "";
  if (points.length === 2)
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    // Control point is midway between current and next, offset perpendicular
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;

    path += ` Q ${midX} ${midY} ${next.x} ${next.y}`;
  }

  return path;
};

export const generateCubicBezierPath = (
  points: { x: number; y: number }[],
): string => {
  if (points.length < 2) return "";
  if (points.length === 2)
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    // Control points at 1/3 and 2/3 of the way, with slight curve
    const dx = next.x - current.x;
    const dy = next.y - current.y;

    const cp1x = current.x + dx * 0.3;
    const cp1y = current.y + dy * 0.3 - 20;
    const cp2x = current.x + dx * 0.7;
    const cp2y = current.y + dy * 0.7 + 20;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  return path;
};

export const generateSimpleCurvePath = (
  points: { x: number; y: number }[],
): string => {
  if (points.length < 2) return "";
  if (points.length === 2)
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    // Simple smooth curve with control point offset
    const cpX = (current.x + next.x) / 2;
    const cpY = Math.min(current.y, next.y) - 15;

    path += ` Q ${cpX} ${cpY} ${next.x} ${next.y}`;
  }

  return path;
};

export const generatePath = (
  points: { x: number; y: number }[],
  curveType: CurveType,
): string => {
  switch (curveType) {
    case "linear":
      return generateLinearPath(points);
    case "catmull-rom":
      return generateCatmullRomPath(points);
    case "quadratic-bezier":
      return generateQuadraticBezierPath(points);
    case "cubic-bezier":
      return generateCubicBezierPath(points);
    case "simple-curve":
      return generateSimpleCurvePath(points);
    default:
      return generateLinearPath(points);
  }
};

// Generate SVG gradient definitions
export const generateSVGGradients = (strokeConfig: StrokeConfig): string => {
  if (strokeConfig.style === StrokeStyle.GRADIENT) {
    return `
      <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${strokeConfig.gradientStart};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${strokeConfig.gradientEnd};stop-opacity:1" />
      </linearGradient>
    `;
  }

  return "";
};
