import { useRef, useState } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker = ({ value, onChange, className = "" }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const presetColors = [
    "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff",
    "#ff8000", "#8000ff", "#0080ff", "#80ff00", "#ff0080", "#00ff80", "#8080ff", "#ff8080",
    "#808080", "#404040", "#800000", "#008000", "#000080", "#808000", "#800080", "#008080"
  ];

  const handleOpen = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const popupHeight = 180; // Approximate height of the popup

    // Check if there's enough space below, otherwise position above
    const spaceBelow = viewportHeight - rect.bottom;
    setPosition(spaceBelow >= popupHeight ? 'bottom' : 'top');
    setIsOpen(true);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className={`w-8 h-8 rounded border border-neutral-800 cursor-pointer ${className}`}
        style={{ backgroundColor: value }}
      />

      {isOpen && (
        <div className={`absolute ${position === 'bottom' ? 'top-10' : 'bottom-10'} right-0 z-50 p-3 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg w-48`}>
          <div className="grid grid-cols-8 gap-1 mb-3">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
                className="w-5 h-5 rounded border border-neutral-600 hover:border-neutral-400 transition-colors"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="flex-1 px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-white font-mono"
              placeholder="#ffffff"
            />
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};