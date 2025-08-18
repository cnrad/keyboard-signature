import { motion, AnimatePresence } from "motion/react";
import type { ClaimedSignature } from "@/hooks/useSignatures";

interface SignatureDetailModalProps {
  signature: ClaimedSignature | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SignatureDetailModal = ({ signature, isOpen, onClose }: SignatureDetailModalProps) => {
  if (!signature || !isOpen) return null;

  const handleTwitterRedirect = (username: string) => {
    window.open(`https://twitter.com/${username}`, '_blank');
  };

  const downloadSignature = (format: 'svg' | 'png') => {
    if (format === 'svg') {
      const height = signature.include_numbers ? 260 : 200;
      const gradients = signature.stroke_config.style === 'gradient'
        ? `<linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" style="stop-color:${signature.stroke_config.gradientStart};stop-opacity:1" />
             <stop offset="100%" style="stop-color:${signature.stroke_config.gradientEnd};stop-opacity:1" />
           </linearGradient>`
        : '';
      const strokeColor = signature.stroke_config.style === 'solid' 
        ? signature.stroke_config.color 
        : "url(#pathGradient)";

      const svgContent = `<svg width="650" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>${gradients}</defs>
            <path d="${signature.signature_path}" stroke="${strokeColor}" stroke-width="${signature.stroke_config.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;

      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${signature.name}-signature.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'png') {
      const height = signature.include_numbers ? 260 : 200;
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

      // Configure stroke
      ctx.lineWidth = signature.stroke_config.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Set stroke style based on configuration
      if (signature.stroke_config.style === 'solid') {
        ctx.strokeStyle = signature.stroke_config.color;
      } else if (signature.stroke_config.style === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, 650, 0);
        gradient.addColorStop(0, signature.stroke_config.gradientStart);
        gradient.addColorStop(1, signature.stroke_config.gradientEnd);
        ctx.strokeStyle = gradient;
      }

      const path = new Path2D(signature.signature_path);
      ctx.stroke(path);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${signature.name}-signature.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.6, 1, 0.26, 1] }}
          className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Signature Details</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors duration-150"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          {/* Signature Display */}
          <div className="mb-6 bg-black rounded-lg p-6 flex items-center justify-center">
            <svg
              width="100%"
              height={signature.include_numbers ? "200" : "160"}
              viewBox={`0 0 650 ${signature.include_numbers ? 260 : 200}`}
              className="w-full max-w-md mx-auto"
              style={{ display: 'block' }}
            >
              <defs>
                {signature.stroke_config.style === 'gradient' && (
                  <linearGradient id="detailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={signature.stroke_config.gradientStart} stopOpacity={1} />
                    <stop offset="100%" stopColor={signature.stroke_config.gradientEnd} stopOpacity={1} />
                  </linearGradient>
                )}
              </defs>
              
              <path
                d={signature.signature_path}
                stroke={signature.stroke_config.style === 'solid' ? signature.stroke_config.color : "url(#detailGradient)"}
                strokeWidth={signature.stroke_config.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Signature Info */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">&quot;{signature.name}&quot;</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-neutral-400">Claimed by</p>
                  <button
                    onClick={() => handleTwitterRedirect(signature.claimed_by_username)}
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-100 font-medium"
                  >
                    @{signature.claimed_by_username}
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-neutral-500">
                <p>Claimed on {new Date(signature.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-400">Style</p>
                <p className="text-white capitalize">{signature.stroke_config.style}</p>
              </div>
              <div>
                <p className="text-neutral-400">Width</p>
                <p className="text-white">{signature.stroke_config.width}px</p>
              </div>
              {signature.include_numbers && (
                <div className="col-span-2">
                  <p className="text-neutral-400">Includes Numbers</p>
                  <p className="text-white">Yes</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <button
              onClick={() => downloadSignature('svg')}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:brightness-85 transition-all duration-150"
            >
              Download SVG
            </button>
            <button
              onClick={() => downloadSignature('png')}
              className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:brightness-85 transition-all duration-150"
            >
              Download PNG
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};