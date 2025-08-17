import { useEffect, useMemo, useState } from "react";

type KeyboardLayout = "qwerty";
type CurveType =
  | "linear"
  | "catmull-rom"
  | "quadratic-bezier"
  | "cubic-bezier"
  | "simple-curve";

type Key = {
  x: number;
  y: number;
};

const generateLinearPath = (points: { x: number; y: number }[]): string => {
  if (points.length === 0) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  return path;
};

const generateCatmullRomPath = (points: { x: number; y: number }[]): string => {
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

const generateQuadraticBezierPath = (
  points: { x: number; y: number }[]
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

const generateCubicBezierPath = (
  points: { x: number; y: number }[]
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

const generateSimpleCurvePath = (
  points: { x: number; y: number }[]
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

const generatePath = (
  points: { x: number; y: number }[],
  curveType: CurveType
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

const keyboardLayouts: Record<KeyboardLayout, Record<string, Key>> = {
  qwerty: {
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
} as const;

export const KeyboardSignature = () => {
  const [name, setName] = useState("");
  const [curveType, setCurveType] = useState<CurveType>("simple-curve");
  // TODO: implement multiple keyboard layouts I guess
  const [currentKeyboardLayout, _setCurrentKeyboardLayout] =
    useState<KeyboardLayout>("qwerty");
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Flash keyboard when name changes
  useEffect(() => {
    if (name.length > 0) {
      setKeyboardVisible(true);

      const timer = setTimeout(() => {
        setKeyboardVisible(false);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setKeyboardVisible(false);
    }
  }, [name]);

  // Calculate signature path
  const signaturePath = useMemo(() => {
    if (!name) return "";

    const points = [];

    for (const char of name.toUpperCase()) {
      if (char in keyboardLayouts[currentKeyboardLayout]) {
        const { x, y } = keyboardLayouts[currentKeyboardLayout][char];
        // Adjust coordinates (multiply by 60 for spacing)
        points.push({ x: x * 60 + 28, y: y * 60 + 40 });
      }
    }

    if (points.length === 0) return "";

    return generatePath(points, curveType);
  }, [name, curveType]);

  // Get active keys for highlighting
  const activeKeys = useMemo(() => {
    return new Set(
      name
        .toUpperCase()
        .split("")
        .filter((char) => char in keyboardLayouts[currentKeyboardLayout])
    );
  }, [name]);

  // Export functions
  const exportSVG = () => {
    if (!signaturePath || !name) return;

    const svgContent = `<svg width="650" height="200" xmlns="http://www.w3.org/2000/svg">
          <path d="${signaturePath}" stroke="black" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-signature.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = () => {
    if (!signaturePath || !name) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1300;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Higher res
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 650, 200);

    // Signature path
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const path = new Path2D(signaturePath);
    ctx.stroke(path);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}-signature.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div
      className={`flex flex-col sm:items-center sm:justify-center max-sm:mx-auto max-sm:w-[28rem] sm:w-fit`}
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="placeholder-neutral-800 [&::placeholder]:duration-200 [&::placeholder]:transition-all focus:placeholder-neutral-600 tracking-wide text-4xl text-white bg-transparent duration-150 transition-all ease-out px-4 py-2 text-center outline-none"
      />

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {(
          [
            "linear",
            "simple-curve",
            "quadratic-bezier",
            "cubic-bezier",
            "catmull-rom",
          ] as CurveType[]
        ).map((type) => (
          <button
            key={type}
            onClick={() => setCurveType(type)}
            className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
              curveType === type
                ? "bg-white text-black font-medium"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
            }`}
          >
            {type.replace("-", " ")}
          </button>
        ))}
      </div>

      <div className="relative mb-4 mt-8 max-sm:mt-0 max-sm:scale-70 max-sm:-ml-22">
        {/* Keyboard */}
        <div
          className={`relative transition-opacity ease-out ${
            name.length === 0
              ? "opacity-100"
              : keyboardVisible
              ? "opacity-100 brightness-125 duration-50"
              : "opacity-0 duration-4000"
          }`}
          style={{ width: "650px", height: "200px" }}
        >
          {Object.entries(keyboardLayouts[currentKeyboardLayout]).map(
            ([char, pos]) => {
              const isActive = activeKeys.has(char);
              const isCurrentKey =
                name.length > 0 && name.toUpperCase()[name.length - 1] === char;

              return (
                <div
                  key={char}
                  onClick={() => setName((p) => p + char)}
                  className={`absolute w-14 h-12 rounded-lg border flex items-center justify-center text-sm font-mono transition-all duration-200 active:scale-95 ${
                    isCurrentKey
                      ? "bg-white/50 border-neutral-400 text-black shadow-lg shadow-white-500/50 scale-110"
                      : isActive
                      ? "bg-neutral-900 border-neutral-800 text-white"
                      : "bg-transparent border-neutral-800/50 text-neutral-300"
                  }`}
                  style={{
                    left: `${pos.x * 60}px`,
                    top: `${pos.y * 60 + 15}px`,
                  }}
                >
                  {char}
                </div>
              );
            }
          )}
        </div>

        {/* Signature */}
        <svg
          className="pointer-events-none absolute top-0 left-0"
          width="650"
          height="200"
          style={{ zIndex: 10 }}
        >
          <title>
            A digital signature, created by connecting the points of typed
            letters on the keyboard.
          </title>

          {signaturePath ? (
            <path
              d={signaturePath}
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </svg>
      </div>

      <div
        className={`max-sm:w-[20rem] max-sm:mx-auto flex flex-col gap-2 sm:mt-8 transition-all ease-in-out ${
          name.length > 0
            ? "opacity-100 tramslate-y-0 duration-1000"
            : "opacity-0 translate-y-2 duration-150"
        }`}
      >
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={exportSVG}
            className="bg-white text-black px-3.5 py-1.5 origin-right rounded-md text-sm font-semibold cursor-pointer active:scale-98 active:brightness-70 hover:brightness-85 transition-all duration-100 ease-out"
          >
            Export SVG
          </button>

          <button
            type="button"
            onClick={exportPNG}
            className="bg-white text-black px-3.5 py-1.5 origin-left rounded-md text-sm font-semibold cursor-pointer active:scale-98 active:brightness-70 hover:brightness-85 transition-all duration-100 ease-out"
          >
            Export PNG
          </button>
        </div>

        <a
          href="https://github.com/cnrad/keyboard-signature"
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-neutral-500 border border-neutral-700/50 px-3.5 py-1.5 bg-neutral-900/50 text-sm rounded-md text-center hover:bg-neutral-900/75 hover:text-neutral-200 transition-all duration-100 ease-out"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
};
