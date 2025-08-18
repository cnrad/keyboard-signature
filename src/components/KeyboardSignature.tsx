import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardLayout,
  CurveType,
  generatePath,
  getKeyboardLayout,
} from "@/util/constants";
import { AnimatePresence, motion } from "motion/react";

export const KeyboardSignature = () => {
  const [name, setName] = useState("");
  const [currentKeyboardLayout, setCurrentKeyboardLayout] =
    useState<KeyboardLayout>(KeyboardLayout.QWERTY);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [curveType, setCurveType] = useState<CurveType>("linear");
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(false);

  // Focus on input when user types
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement === inputRef.current;

      if (!isInputFocused) {
        const regex = includeNumbers ? /^[a-zA-Z0-9]$/ : /^[a-zA-Z]$/;
        if (regex.test(e.key) || e.key === "Backspace") {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [includeNumbers]);

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
  }, [name, currentKeyboardLayout, includeNumbers]);

  // Calculate signature path
  const signaturePath = useMemo(() => {
    if (!name) return "";

    const points = [];
    const currentLayout = getKeyboardLayout(
      currentKeyboardLayout,
      includeNumbers,
    );

    for (const char of name.toUpperCase()) {
      if (char in currentLayout) {
        const { x, y } = currentLayout[char];
        const yOffset = includeNumbers ? 100 : 40;
        points.push({ x: x * 60 + 28, y: y * 60 + yOffset });
      }
    }

    if (points.length === 0) return "";

    // SVG path
    return generatePath(points, curveType);
  }, [name, currentKeyboardLayout, curveType, includeNumbers]);

  // Get active keys for highlighting
  const activeKeys = useMemo(() => {
    const currentLayout = getKeyboardLayout(
      currentKeyboardLayout,
      includeNumbers,
    );
    return new Set(
      name
        .toUpperCase()
        .split("")
        .filter((char) => char in currentLayout),
    );
  }, [name, currentKeyboardLayout, includeNumbers]);

  // Export functions
  const exportSVG = () => {
    if (!signaturePath || !name) return;

    const height = includeNumbers ? 260 : 200;
    const svgContent = `<svg width="650" height="${height}" xmlns="http://www.w3.org/2000/svg">
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

    const height = includeNumbers ? 260 : 200;
    const canvas = document.createElement("canvas");
    canvas.width = 1300;
    canvas.height = height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Higher res
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 650, height);

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
      <a
        className="absolute cursor-pointer left-1/2 bottom-8 -translate-x-1/2 opacity-50 hover:opacity-100 text-sm flex flex-col items-center transition-all duration-150 ease-out text-center"
        href="https://axiom.trade/meme/3URGpspzJUT7d3LN1kfbjm6koy5fNQTgQqDY8Zh1rZ8H"
        rel="noreferrer noopener"
        target="_blank"
      >
        <p className="font-bold text-white text-base">$SIGN</p>
        <p className=" text-neutral-300 max-sm:break-all">
          <span className="text-neutral-400 font-bold">CA:</span>{" "}
          GjbLHUmyUo6JFczvaTbsj9p1LjsXmvR8Vk9gRPNLBAGS
        </p>
      </a>

      <input
        autoFocus
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="placeholder-neutral-800 leading-[1] [&::placeholder]:duration-200 [&::placeholder]:transition-all focus:placeholder-neutral-600 tracking-wide text-4xl text-white bg-transparent duration-150 transition-all ease-out px-4 py-2 text-center outline-none"
      />

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
          style={{ width: "650px", height: includeNumbers ? "260px" : "200px" }}
        >
          {Object.entries(
            getKeyboardLayout(currentKeyboardLayout, includeNumbers),
          ).map(([char, pos]) => {
            const isActive = activeKeys.has(char);
            const isCurrentKey =
              name.length > 0 && name.toUpperCase()[name.length - 1] === char;

            return (
              <div
                key={char}
                onClick={() => setName((p) => p + char)}
                className={`absolute w-14 h-12 rounded-lg border flex items-center justify-center text-sm font-mono transition-[transform,color,background-color,border-color] duration-200 active:scale-95 ${
                  isCurrentKey
                    ? "bg-white/50 border-neutral-400 text-black scale-110"
                    : isActive
                      ? "bg-neutral-900 border-neutral-800 text-white"
                      : "bg-transparent border-neutral-800/50 text-neutral-300"
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

        {/* Signature */}
        <svg
          className="pointer-events-none absolute top-0 left-0"
          width="650"
          height={includeNumbers ? "260" : "200"}
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
        className={`max-sm:w-[20rem] max-sm:mx-auto flex flex-col gap-2 sm:mt-8 transition-all ease-in-out ${name.length > 0 ? "opacity-100 translate-y-0 duration-1000" : "pointer-events-none opacity-0 translate-y-2 duration-150"}`}
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
          className="font-medium text-neutral-500 border border-neutral-700/50 px-3.5 py-1.5 bg-neutral-900/50 text-sm rounded-md text-center active:scale-98 active:brightness-70 hover:brightness-85 transition-all duration-100 ease-out"
        >
          View on GitHub
        </a>
      </div>

      <AnimatePresence>
        {optionsOpen ? (
          <motion.div
            initial={{ y: 4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 4, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.6, 1, 0.26, 1],
            }}
            className="flex flex-col items-start max-sm:-translate-x-1/2 max-sm:left-1/2 max-sm:w-[calc(100%-3rem)] sm:max-w-xs absolute sm:right-6 bottom-6 p-4 rounded-xl bg-neutral-950 border-neutral-800/50 border z-10"
          >
            <button
              onClick={() => setOptionsOpen(false)}
              className="text-sm text-neutral-600 hover:text-neutral-400 absolute right-4 top-4 cursor-pointer"
            >
              Close
            </button>

            <p className="font-semibold text-neutral-400 mb-4">Options</p>

            <div className="grid grid-cols-[5rem_1fr] gap-y-4">
              {/* Layout */}
              <label
                htmlFor="keyboard-layout"
                className="text-neutral-300 text-sm font-medium mr-8 mt-1"
              >
                Layout
              </label>
              <select
                id="keyboard-layout"
                className="border border-neutral-800 rounded-md px-2 py-1 bg-neutral-900 text-white text-sm"
                value={currentKeyboardLayout}
                onChange={(e) => {
                  setCurrentKeyboardLayout(e.target.value as KeyboardLayout);
                }}
              >
                {Object.values(KeyboardLayout).map((layout) => (
                  <option
                    key={layout}
                    value={layout}
                    className="text-neutral-500"
                  >
                    {layout}
                  </option>
                ))}
              </select>

              {/* Curve */}
              <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">
                Curve
              </p>
              <div className="flex flex-wrap gap-1">
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
                    className={`px-3 py-1 text-xs rounded-full transition-all duration-150 ease-out cursor-pointer border ${
                      curveType === type
                        ? "bg-white text-black font-medium border-white"
                        : "bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border-neutral-800"
                    }`}
                  >
                    {type.replace("-", " ")}
                  </button>
                ))}
              </div>

              {/* Numbers Toggle */}
              <p className="text-neutral-300 text-sm font-medium mr-8">
                Numbers
              </p>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${includeNumbers ? "bg-white" : "bg-neutral-700"}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-black rounded-full transition-transform duration-200 ${includeNumbers ? "translate-x-5" : "translate-x-0"}`}
                  />
                </div>
              </label>
            </div>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setOptionsOpen(true)}
            className="absolute bottom-6 right-6 px-4 py-2 rounded-lg bg-neutral-950 border-neutral-800/50 border cursor-pointer text-sm font-medium text-neutral-200"
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -4, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.6, 1, 0.26, 1],
            }}
          >
            Options
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
