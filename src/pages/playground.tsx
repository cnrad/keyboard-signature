import { SignatureDrawing } from "@/components/SignatureDrawing";
import {
  DEFAULT_OPTIONS,
  SignatureOptions,
} from "@/components/SignatureOptions";
import { useEffect, useMemo, useRef, useState } from "react";

// TODO:
// - abstract toggle to its own component

export default function Home() {
  const [name, setName] = useState("");
  const [options, setOptions] = useState<SignatureOptions>(DEFAULT_OPTIONS);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMainInputFocused = document.activeElement === inputRef.current;
      const isSearchInputFocused =
        document.activeElement === searchInputRef.current;
      const isAnyInputFocused = document.activeElement?.tagName === "INPUT";

      if (!isMainInputFocused && !isSearchInputFocused && !isAnyInputFocused) {
        const regex = options.includeNumbers ? /^[a-zA-Z0-9]$/ : /^[a-zA-Z]$/;
        if (regex.test(e.key) || e.key === "Backspace") {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options.includeNumbers]);

  // // Export functions
  // const exportSVG = () => {
  //   if (!name) return;

  //   const height = options.includeNumbers ? 260 : 200;
  //   const gradients =
  //     options.style === ColorType.GRADIENT
  //       ? `<linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
  //          ${generateSVGGradient(
  //            options.gradientStart,
  //            options.gradientEnd
  //          )}
  //        </linearGradient>`
  //       : "";
  //   const strokeColor =
  //     options.style === ColorType.SOLID
  //       ? options.color
  //       : "url(#pathGradient)";

  //   const svgContent = `<svg width="650" height="${height}" xmlns="http://www.w3.org/2000/svg">
  //         <defs>${gradients}</defs>
  //         <path d="${signaturePath}" stroke="${strokeColor}" stroke-width="${options.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  //       </svg>`;

  //   const blob = new Blob([svgContent], { type: "image/svg+xml" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `${name}-signature.svg`;
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };

  // const exportPNG = () => {
  //   if (!signaturePath || !name) return;

  //   const height = includeNumbers ? 260 : 200;
  //   const canvas = document.createElement("canvas");
  //   canvas.width = 1300;
  //   canvas.height = height * 2;
  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;

  //   // Higher res
  //   ctx.scale(2, 2);

  //   // Background
  //   ctx.fillStyle = "black";
  //   ctx.fillRect(0, 0, 650, height);

  //   // Configure stroke
  //   ctx.lineWidth = strokeConfig.width;
  //   ctx.lineCap = "round";
  //   ctx.lineJoin = "round";

  //   // Set stroke style based on configuration
  //   if (strokeConfig.style === ColorType.SOLID) {
  //     ctx.strokeStyle = strokeConfig.color;
  //   } else if (strokeConfig.style === ColorType.GRADIENT) {
  //     const gradient = ctx.createLinearGradient(0, 0, 650, 0);
  //     gradient.addColorStop(0, strokeConfig.gradientStart);
  //     gradient.addColorStop(1, strokeConfig.gradientEnd);
  //     ctx.strokeStyle = gradient;
  //   }

  //   const path = new Path2D(signaturePath);
  //   ctx.stroke(path);

  //   canvas.toBlob((blob) => {
  //     if (!blob) return;
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `${name}-signature.png`;
  //     a.click();
  //     URL.revokeObjectURL(url);
  //   });
  // };

  return (
    <div className="w-full h-full flex lg:flex-row flex-col items-center lg:items-start gap-4 px-24 mt-10">
      <div className="w-full flex flex-col items-center max-w-[50rem]">
        <SignatureDrawing name={name} options={options} />

        <input
          autoFocus
          ref={inputRef}
          value={name}
          onChange={(e) => {
            setName(e.target.value);

            const path = document.querySelector(
              "#signature-path"
            ) as SVGPathElement;
            const length = path?.getTotalLength();
            if (path && length) {
              document.documentElement.style.setProperty(
                "--path-length",
                length.toString() + "px"
              );
            }
          }}
          placeholder="Enter your name here"
          className="w-full mb-8 placeholder-neutral-800 leading-[1] [&::placeholder]:duration-200 [&::placeholder]:transition-colors focus:placeholder-neutral-700 tracking-wide text-4xl text-white duration-150 transition-colors ease-out px-4 py-3 text-center outline-none rounded-xl border border-neutral-900"
        />

        <div className="grid grid-cols-2 gap-2 max-w-[20rem]">
          <button
            type="button"
            // onClick={exportSVG}
            className="bg-white text-black px-3.5 py-1.5 origin-right rounded-md text-sm font-semibold cursor-pointer active:scale-98 active:brightness-70 hover:brightness-85 transition-all duration-100 ease-out"
          >
            Export SVG
          </button>

          <button
            type="button"
            // onClick={exportPNG}
            className="bg-white text-black px-3.5 py-1.5 origin-left rounded-md text-sm font-semibold cursor-pointer active:scale-98 active:brightness-70 hover:brightness-85 transition-all duration-100 ease-out"
          >
            Export PNG
          </button>
        </div>
      </div>

      <SignatureOptions options={options} setOptions={setOptions} />
    </div>
  );
}
