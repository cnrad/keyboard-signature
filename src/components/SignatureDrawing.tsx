import { generateSVGGradient } from "@/util/color";
import {
  ColorType,
  StrokeType,
  generatePath,
  getKeyboardLayout,
} from "@/util/constants";
import { useEffect, useMemo, useState } from "react";
import { SignatureOptions } from "./SignatureOptions";
import { cn } from "@/util/cn";

export const SignatureDrawing = ({
  name,
  options,
  className,
}: {
  name: string;
  options: SignatureOptions;
  className?: string;
}) => {
  const {
    keyboardLayout: currentKeyboardLayout,
    includeNumbers,
    curveType,
  } = options;

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const activeKeys = useMemo(() => {
    const currentLayout = getKeyboardLayout(
      currentKeyboardLayout,
      includeNumbers
    );

    return new Set(
      name
        .toUpperCase()
        .split("")
        .filter((char) => char in currentLayout)
    );
  }, [name, currentKeyboardLayout, includeNumbers]);

  //   useEffect(() => {
  //     const handleKeyDown = (e: KeyboardEvent) => {
  //       const isMainInputFocused = document.activeElement === inputRef.current;
  //       const isSearchInputFocused =
  //         document.activeElement === searchInputRef.current;
  //       const isAnyInputFocused = document.activeElement?.tagName === "INPUT";

  //       if (!isMainInputFocused && !isSearchInputFocused && !isAnyInputFocused) {
  //         const regex = includeNumbers ? /^[a-zA-Z0-9]$/ : /^[a-zA-Z]$/;
  //         if (regex.test(e.key) || e.key === "Backspace") {
  //           inputRef.current?.focus();
  //         }
  //       }
  //     };

  //     window.addEventListener("keydown", handleKeyDown);
  //     return () => window.removeEventListener("keydown", handleKeyDown);
  //   }, [includeNumbers]);

  useEffect(() => {
    setKeyboardVisible(true);

    const timer = setTimeout(() => {
      if (name.length > 0) setKeyboardVisible(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [name, currentKeyboardLayout, includeNumbers]);

  const signaturePath = useMemo(() => {
    if (!name) return ""; // Use name directly for immediate signature generation

    const points = [];
    const currentLayout = getKeyboardLayout(
      currentKeyboardLayout,
      includeNumbers
    );

    for (const char of name.toUpperCase()) {
      if (char in currentLayout) {
        const { x, y } = currentLayout[char];
        const yOffset = includeNumbers ? 100 : 40;
        points.push({ x: x * 60 + 28, y: y * 60 + yOffset });
      }
    }

    if (points.length === 0) return "";
    return generatePath(points, curveType);
  }, [name, currentKeyboardLayout, curveType, includeNumbers]); // Use name directly

  return (
    <div
      className={cn(
        "w-full bg-black rounded-2xl border border-white/8 inset-shadow-xs inset-shadow-white/15 p-12 mb-4 overflow-clip",
        className
      )}
    >
      <div className="relative flex items-center flex-col">
        <div
          className={`relative transition-opacity ease-out shrink-0 ${
            keyboardVisible
              ? "opacity-100 brightness-100 duration-50"
              : "opacity-0 duration-3000"
          }`}
          style={{
            width: "650px",
            height: options.includeNumbers ? "260px" : "200px",
          }}
        >
          {Object.entries(
            getKeyboardLayout(currentKeyboardLayout, includeNumbers)
          ).map(([char, pos]) => {
            const isActive = activeKeys.has(char);
            const isCurrentKey =
              name.length > 0 && name.toUpperCase()[name.length - 1] === char;

            return (
              <div
                key={char}
                className={`absolute w-14 h-12 rounded-lg border flex items-center justify-center text-sm font-mono font-bold transition-[scale,transform,color,background-color,border-color] duration-200 active:scale-95 ${
                  isCurrentKey
                    ? "bg-white/50 border-neutral-400 text-black scale-110"
                    : isActive
                    ? "bg-neutral-900 border-neutral-800 text-white/50"
                    : "bg-transparent border-neutral-800/50 text-neutral-300/60"
                }`}
                style={{
                  left: `${pos.x * 60}px`,
                  top: `${pos.y * 60 + (includeNumbers ? 75 : 15)}px`,
                }}
              >
                {char}
              </div>
            );
          })}
        </div>

        <svg
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
          width="650"
          height={includeNumbers ? "260" : "200"}
          style={{ zIndex: 10 }}
        >
          <defs>
            {options.style === ColorType.GRADIENT && (
              // Gradient stops, using oklab which is then converted to many hex color stops for better interpolation
              <linearGradient
                id="pathGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                {generateSVGGradient(
                  options.gradientStart,
                  options.gradientEnd
                )}
              </linearGradient>
            )}

            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur
                stdDeviation={options.width}
                result="coloredBlur"
              />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {signaturePath ? (
            <path
              id="signature-path"
              d={signaturePath}
              stroke={
                options.style === ColorType.SOLID
                  ? options.color
                  : "url(#pathGradient)"
              }
              strokeWidth={options.width}
              strokeDasharray={
                options.stroke === "solid"
                  ? "0"
                  : options.stroke === "dashed"
                  ? "6 12"
                  : "0 8"
              }
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={options.glow ? "url(#glow)" : undefined}
              className={
                options.animated && options.stroke === StrokeType.SOLID
                  ? "solid-path"
                  : undefined
              }
            />
          ) : null}
        </svg>
      </div>
    </div>
  );
};
