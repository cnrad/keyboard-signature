import { motion } from "motion/react";
import { useUserClaimedSignatures } from "@/hooks/useSignaturesQuery";
import type { ClaimedSignature } from "@/hooks/useSignatures";
import { handleTweet } from "@/lib/tweet";
import { XIcon } from "./XIcon";

interface ClaimedPageProps {
  onBack: () => void;
  user: { id: string; username: string; profilePic: string } | null;
}

export const ClaimedPage = ({ onBack, user }: ClaimedPageProps) => {
  const { data: userClaimedSignatures = [] } = useUserClaimedSignatures();

  const downloadSignature = (signature: ClaimedSignature) => {
    const height = signature.include_numbers ? 260 : 200;
    const canvas = document.createElement("canvas");
    canvas.width = 1300;
    canvas.height = height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(2, 2);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 650, height);
    ctx.lineWidth = signature.stroke_config.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (signature.stroke_config.style === "solid") {
      ctx.strokeStyle = signature.stroke_config.color;
    } else if (signature.stroke_config.style === "gradient") {
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: [0.6, 1, 0.26, 1] }}
      className="w-full max-w-4xl mx-auto p-6 flex flex-col justify-start h-full"
    >
      <div className="flex max-sm:flex-col max-sm:items-start items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            type="button"
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors duration-150"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Claimed Signatures</h1>
        </div>

        {user && (
          <div className="flex items-center gap-3 max-sm:mt-4">
            <img
              src={user.profilePic}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-white font-medium">@{user.username}</span>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {userClaimedSignatures.length > 0 ? (
          userClaimedSignatures.map((signature, index) => (
            <motion.div
              key={signature.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="bg-neutral-900/50 border border-neutral-700/50 rounded-xl p-6 transition-colors duration-200"
            >
              <div className="flex max-sm:flex-col items-center justify-between">
                <div className="flex items-center gap-4 max-sm:w-full">
                  <div className="bg-black rounded-lg p-4 w-40 h-20 flex items-center justify-center">
                    <svg
                      width="600"
                      height="200"
                      viewBox="0 0 600 200"
                      className="w-full h-full"
                      aria-label={`Signature for ${signature.name}`}
                    >
                      <defs>
                        {signature.stroke_config.style === "gradient" && (
                          <linearGradient
                            id={`gradient-${signature.id}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop
                              offset="0%"
                              stopColor={signature.stroke_config.gradientStart}
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor={signature.stroke_config.gradientEnd}
                              stopOpacity={1}
                            />
                          </linearGradient>
                        )}
                      </defs>
                      <path
                        d={signature.signature_path}
                        stroke={
                          signature.stroke_config.style === "solid"
                            ? signature.stroke_config.color
                            : `url(#gradient-${signature.id})`
                        }
                        strokeWidth={signature.stroke_config.width}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {signature.name}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Claimed on{" "}
                      {new Date(signature.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className=" max-sm:mt-4 flex items-center gap-2 max-sm:w-full">
                  <button
                    type="button"
                    onClick={() => handleTweet(signature.name)}
                    className="cursor-pointer bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-white font-semibold px-4 py-2 rounded-md text-sm transition-all duration-100 max-sm:w-full flex items-center justify-center gap-2"
                  >
                    <XIcon className="size-4 fill-white" />
                    Share on X
                  </button>

                  <button
                    onClick={() => downloadSignature(signature)}
                    type="button"
                    className="cursor-pointer bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:brightness-85 transition-all duration-100 max-sm:w-full"
                  >
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-center py-12"
          >
            <h3 className="text-lg font-medium text-white mb-2">
              No claimed signatures
            </h3>
            <p className="text-neutral-400">
              Start creating signatures and claim them to see them here.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
