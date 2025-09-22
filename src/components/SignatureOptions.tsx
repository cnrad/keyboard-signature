import { cn } from "@/util/cn";
import {
  ColorType,
  StrokeType,
  KeyboardLayout,
  CurveType,
} from "@/util/constants";
import Colorful from "@uiw/react-color-colorful";

export type SignatureOptions = {
  keyboardLayout: KeyboardLayout;
  includeNumbers: boolean;
  style: ColorType;
  stroke: StrokeType;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  curveType: CurveType;
  width: number;
  glow: boolean;
  animated: boolean;
};

export const DEFAULT_OPTIONS: SignatureOptions = {
  style: ColorType.SOLID,
  stroke: StrokeType.SOLID,
  color: "#ffffff",
  gradientStart: "#ff6b6b",
  gradientEnd: "#4ecdc4",
  width: 3,
  glow: false,
  keyboardLayout: KeyboardLayout.QWERTY,
  includeNumbers: false,
  curveType: "linear",
  animated: false,
};

export const SignatureOptions = ({
  options,
  setOptions,
  className,
}: {
  options: SignatureOptions;
  setOptions: React.Dispatch<React.SetStateAction<SignatureOptions>>;
  className?: string;
}) => {
  const resetToDefaults = () => {
    setOptions(DEFAULT_OPTIONS);
  };

  return (
    <div
      className={cn(
        "max-w-[30rem] w-full h-fit bg-neutral-950 border border-neutral-900 rounded-xl px-10 py-6 text-white mb-20",
        className
      )}
      style={{
        boxShadow: "inset 0 0 4px 0px var(--color-neutral-900)",
      }}
    >
      <div className="grid grid-cols-[5rem_1fr] gap-y-4 ">
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
          value={options.keyboardLayout}
          onChange={(e) => {
            setOptions((p) => ({
              ...p,
              keyboardLayout: e.target.value as KeyboardLayout,
            }));
          }}
        >
          {Object.values(KeyboardLayout).map((layout) => (
            <option key={layout} value={layout} className="text-neutral-500">
              {layout}
            </option>
          ))}
        </select>

        {/* Curve */}
        <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">Curve</p>
        <div className="flex flex-wrap gap-1">
          {(
            [
              "linear",
              "simple-curve",
              "cubic-bezier",
              "catmull-rom",
            ] as CurveType[]
          ).map((type) => (
            <button
              key={type}
              onClick={() => setOptions((p) => ({ ...p, curveType: type }))}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-150 ease-out cursor-pointer border ${
                options.curveType === type
                  ? "bg-white text-black font-medium border-white"
                  : "bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border-neutral-800"
              }`}
            >
              {type.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Stroke Style */}
        <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">Stroke</p>
        <div className="flex flex-wrap gap-1">
          {Object.values(StrokeType).map((stroke) => (
            <button
              key={stroke}
              onClick={() => setOptions((prev) => ({ ...prev, stroke }))}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-150 ease-out cursor-pointer border ${
                options.stroke === stroke
                  ? "bg-white text-black font-medium border-white"
                  : "bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border-neutral-800"
              }`}
            >
              {stroke}
            </button>
          ))}
        </div>

        {/* Color Style */}
        <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">Type</p>
        <div className="flex flex-wrap gap-1">
          {Object.values(ColorType).map((style) => (
            <button
              key={style}
              onClick={() => setOptions((prev) => ({ ...prev, style }))}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-150 ease-out cursor-pointer border ${
                options.style === style
                  ? "bg-white text-black font-medium border-white"
                  : "bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border-neutral-800"
              }`}
            >
              {style}
            </button>
          ))}
        </div>

        {/* Color Picker */}
        {options.style === ColorType.SOLID ? (
          <>
            <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">
              Color
            </p>
            <Colorful
              disableAlpha
              color={options.color}
              onChange={(color) => {
                setOptions((prev) => ({ ...prev, color: color.hex }));
              }}
            />
          </>
        ) : (
          <>
            <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">
              Colors
            </p>
            <div className="flex items-center gap-2">
              <Colorful
                disableAlpha
                color={options.gradientStart}
                onChange={(color) => {
                  setOptions((prev) => ({
                    ...prev,
                    gradientStart: color.hex,
                  }));
                }}
                className="max-w-30"
              />
              <Colorful
                disableAlpha
                color={options.gradientEnd}
                onChange={(color) => {
                  setOptions((prev) => ({
                    ...prev,
                    gradientEnd: color.hex,
                  }));
                }}
                className="max-w-30"
              />
            </div>
          </>
        )}

        {/* Numbers Toggle */}
        <p className="text-neutral-300 text-sm font-medium mr-8">Numbers</p>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeNumbers}
            onChange={(e) =>
              setOptions((p) => ({ ...p, includeNumbers: e.target.checked }))
            }
            className="sr-only"
          />
          <div
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
              options.includeNumbers ? "bg-white" : "bg-neutral-700"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-black rounded-full transition-transform duration-200 ${
                options.includeNumbers ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </label>

        {/* Glow Toggle */}
        <p className="text-neutral-300 text-sm font-medium mr-8">Glow</p>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={options.glow}
            onChange={() =>
              setOptions((prev) => ({
                ...prev,
                glow: !prev.glow,
              }))
            }
            className="sr-only"
          />
          <div
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
              options.glow ? "bg-white" : "bg-neutral-700"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-black rounded-full transition-transform duration-200 ${
                options.glow ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </label>

        {/* Animation Toggle */}
        <p className="text-neutral-300 text-sm font-medium mr-8">Animated</p>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={options.animated}
            onChange={() =>
              setOptions((p) => ({ ...p, animated: !p.animated }))
            }
            className="sr-only"
          />
          <div
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
              options.animated ? "bg-white" : "bg-neutral-700"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-black rounded-full transition-transform duration-200 ${
                options.animated ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </label>

        {/* Stroke Width */}
        <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">Width</p>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="8"
            value={options.width}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                width: parseInt(e.target.value),
              }))
            }
            className="flex-1"
          />
          <span className="text-neutral-400 text-xs w-6">
            {options.width}px
          </span>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetToDefaults}
        className="mt-4 w-full px-3 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-md transition-colors duration-150 border border-neutral-700 cursor-pointer"
      >
        Reset to Defaults
      </button>
    </div>
  );
};
