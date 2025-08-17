import { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardLayout, keyboardLayouts } from "@/util/constants";

export const KeyboardSignature = () => {
  const [name, setName] = useState("");
  const [currentKeyboardLayout, setCurrentKeyboardLayout] =
    useState<KeyboardLayout>(KeyboardLayout.QWERTY);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // focus on input when user types
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement === inputRef.current;

      if (!isInputFocused) {
        if (/^[a-zA-Z]$/.test(e.key) || e.key === "Backspace") {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

    // SVG path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    return path;
  }, [name, currentKeyboardLayout]);

  // Get active keys for highlighting
  const activeKeys = useMemo(() => {
    return new Set(
      name
        .toUpperCase()
        .split("")
        .filter((char) => char in keyboardLayouts[currentKeyboardLayout]),
    );
  }, [name, currentKeyboardLayout]);

  // Export functions
  const exportSVG = () => {
    if (!signaturePath || !name) return;

    const svgContent = `<svg width="650" height="250" xmlns="http://www.w3.org/2000/svg">
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
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Higher res
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 650, 250);

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
      <div className="max-sm:mx-auto max-sm:mb-10 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:bottom-8 flex flex-row items-center opacity-50 hover:opacity-100 transition-all duration-200 ease-out">
        <label
          htmlFor="keyboard-layout"
          className="text-white text-sm font-medium"
        >
          Layout:
        </label>
        <select
          id="keyboard-layout"
          className="border border-neutral-800 rounded-md ml-2 px-2 py-1 bg-neutral-900 text-white text-sm"
          value={currentKeyboardLayout}
          onChange={(e) => {
            setCurrentKeyboardLayout(e.target.value as KeyboardLayout);
          }}
        >
          {Object.values(KeyboardLayout).map((layout) => (
            <option key={layout} value={layout} className="text-neutral-500">
              {layout}
            </option>
          ))}
        </select>
      </div>

      <input
        autoFocus
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="placeholder-neutral-800 [&::placeholder]:duration-200 [&::placeholder]:transition-all focus:placeholder-neutral-600 tracking-wide text-4xl text-white bg-transparent duration-150 transition-all ease-out px-4 py-2 text-center outline-none"
      />

      <div className="relative mb-4 mt-8 max-sm:mt-0 max-sm:scale-70 max-sm:-ml-22">
        {/* Keyboard */}
        <div
          className={`relative transition-opacity ease-out ${name.length === 0
            ? "opacity-100"
            : keyboardVisible
              ? "opacity-100 brightness-125 duration-50"
              : "opacity-0 duration-4000"
            }`}
          style={{ width: "650px", height: "250px" }}
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
                  className={`absolute w-14 h-12 rounded-lg border flex items-center justify-center text-sm font-mono transition-all duration-200 active:scale-95 ${isCurrentKey
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
            },
          )}
        </div>

        {/* Signature */}
        <svg
          className="pointer-events-none absolute top-0 left-0"
          width="650"
          height="250"
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
    </div>
  );
};
