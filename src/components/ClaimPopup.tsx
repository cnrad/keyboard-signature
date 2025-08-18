import { motion } from "motion/react";
import { StrokeStyle, StrokeConfig } from "@/util/constants";

interface ClaimPopupProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  signaturePath: string;
  strokeConfig: StrokeConfig;
  includeNumbers: boolean;
  user: { username: string; profilePic: string } | null;
}

export const ClaimPopup = ({ 
  isOpen, 
  onClose,
  name, 
  signaturePath, 
  strokeConfig, 
  includeNumbers,
  user 
}: ClaimPopupProps) => {
  const generateTweetText = () => {
    const baseText = `Just claimed my keyboard signature for "${name}" ✨`;
    const hashTags = "#KeyboardSignature #DigitalArt #Crypto";
    const url = "https://keyboard-signature.vercel.app";
    return `${baseText}\n\n${hashTags}\n\n${url}`;
  };

  const handleTweet = () => {
    const tweetText = encodeURIComponent(generateTweetText());
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(twitterUrl, '_blank');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateSignatureDataUrl = () => {
    const height = includeNumbers ? 260 : 200;
    const canvas = document.createElement("canvas");
    canvas.width = 650;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 650, height);

    // Configure stroke
    ctx.lineWidth = strokeConfig.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Set stroke style
    if (strokeConfig.style === StrokeStyle.SOLID) {
      ctx.strokeStyle = strokeConfig.color;
    } else if (strokeConfig.style === StrokeStyle.GRADIENT) {
      const gradient = ctx.createLinearGradient(0, 0, 650, 0);
      gradient.addColorStop(0, strokeConfig.gradientStart);
      gradient.addColorStop(1, strokeConfig.gradientEnd);
      ctx.strokeStyle = gradient;
    }

    const path = new Path2D(signaturePath);
    ctx.stroke(path);

    return canvas.toDataURL("image/png");
  };

  if (!isOpen) return null;

  return (
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
        className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Signature Claimed! 🎉</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors duration-150"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-neutral-800/50 rounded-lg">
            <img
              src={user.profilePic}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm text-neutral-400">Claimed by</p>
              <p className="text-white font-medium">@{user.username}</p>
            </div>
          </div>
        )}

        {/* Flex on Twitter text */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Flex on Twitter!</h3>
          <p className="text-neutral-400 text-sm">Share your unique keyboard signature with the world</p>
        </div>

        {/* Signature Preview */}
        <div className="mb-6 bg-black rounded-lg p-4">
          <svg
            width="100%"
            height={includeNumbers ? "120" : "80"}
            viewBox={`0 0 650 ${includeNumbers ? 260 : 200}`}
            className="w-full"
            style={{ maxWidth: "400px", margin: "0 auto", display: "block" }}
          >
            <defs>
              {strokeConfig.style === StrokeStyle.GRADIENT && (
                <linearGradient id="popupGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={strokeConfig.gradientStart} stopOpacity={1} />
                  <stop offset="100%" stopColor={strokeConfig.gradientEnd} stopOpacity={1} />
                </linearGradient>
              )}
            </defs>
            
            <path
              d={signaturePath}
              stroke={
                strokeConfig.style === StrokeStyle.SOLID
                  ? strokeConfig.color
                  : "url(#popupGradient)"
              }
              strokeWidth={strokeConfig.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-center mt-3">
            <p className="text-white text-sm font-mono bg-neutral-800 px-2 py-1 rounded inline-block">
              &quot;{name}&quot;
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleTweet}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Tweet
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-150"
          >
            Close
          </button>
        </div>

        {/* Mobile optimization note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-neutral-500">
            Your signature is now permanently linked to @{user?.username}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};