import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardLayout,
  CurveType,
  generatePath,
  getKeyboardLayout,
  StrokeStyle,
  StrokeConfig,
} from "@/util/constants";
import { AnimatePresence, motion } from "motion/react";
import { ColorPicker } from "@/components/ColorPicker";
import { ClaimedPage } from "@/components/ClaimedPage";
import { ClaimPopup } from "@/components/ClaimPopup";
import { SignatureDetailModal } from "@/components/SignatureDetailModal";
import type { ClaimedSignature } from "@/hooks/useSignatures";
import { useAuth } from "@/hooks/useAuth";
import {
  useClaimSignature,
  useSignatureByName,
  useSearchSignatures,
  useUnclaimSignature,
} from "@/hooks/useSignaturesQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { XIcon } from "./XIcon";

const DEFAULT_STROKE_CONFIG = {
  style: StrokeStyle.SOLID,
  color: "#ffffff",
  gradientStart: "#ff6b6b",
  gradientEnd: "#4ecdc4",
  width: 3,
};

export const KeyboardSignature = () => {
  const [name, setName] = useState("");
  const [currentKeyboardLayout, setCurrentKeyboardLayout] =
    useState<KeyboardLayout>(KeyboardLayout.QWERTY);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [curveType, setCurveType] = useState<CurveType>("linear");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [claimedBy, setClaimedBy] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showClaimedPage, setShowClaimedPage] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce only the API requests, not signature generation
  const debouncedName = useDebounce(name, 300); // 300ms delay for API calls only
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay for search

  const [selectedSignature, setSelectedSignature] =
    useState<ClaimedSignature | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [claimError, setClaimError] = useState<string | null>(null);

  const { user, signInWithTwitter, signOut } = useAuth();
  const claimSignatureMutation = useClaimSignature();
  const unclaimSignatureMutation = useUnclaimSignature();
  const { data: existingSignature } = useSignatureByName(debouncedName); // API call debounced
  const { searchResults } = useSearchSignatures(debouncedSearchQuery); // Search API debounced
  const [strokeConfig, setStrokeConfig] = useState<StrokeConfig>(
    DEFAULT_STROKE_CONFIG,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const resetToDefaults = () => {
    setCurrentKeyboardLayout(KeyboardLayout.QWERTY);
    setCurveType("linear");
    setIncludeNumbers(false);
    setStrokeConfig({
      style: StrokeStyle.SOLID,
      color: "#ffffff",
      gradientStart: "#ff6b6b",
      gradientEnd: "#4ecdc4",
      width: 3,
    });
  };

  useEffect(() => {
    // Match the existing signature
    if (existingSignature) setStrokeConfig(existingSignature?.stroke_config);
  }, [existingSignature]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMainInputFocused = document.activeElement === inputRef.current;
      const isSearchInputFocused =
        document.activeElement === searchInputRef.current;
      const isAnyInputFocused = document.activeElement?.tagName === "INPUT";

      if (!isMainInputFocused && !isSearchInputFocused && !isAnyInputFocused) {
        const regex = includeNumbers ? /^[a-zA-Z0-9]$/ : /^[a-zA-Z]$/;
        if (regex.test(e.key) || e.key === "Backspace") {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [includeNumbers]);

  useEffect(() => {
    if (!debouncedName) {
      setClaimedBy(null);
      setClaimError(null);
      return;
    }

    if (existingSignature) {
      setClaimedBy(existingSignature.claimed_by_username);
      setClaimError(null);
    } else {
      setClaimedBy(null);
      setClaimError(null);
    }
  }, [debouncedName, existingSignature]);

  useEffect(() => {
    // Assume reset if input is cleared
    if (name.length === 0) {
      setStrokeConfig(DEFAULT_STROKE_CONFIG);
    }

    if (name.length > 1) {
      setKeyboardVisible(true);
      const timer = setTimeout(() => setKeyboardVisible(false), 100);
      return () => clearTimeout(timer);
    } else {
      setKeyboardVisible(false);
    }
  }, [name, currentKeyboardLayout, includeNumbers]);

  const signaturePath = useMemo(() => {
    if (!name) return ""; // Use name directly for immediate signature generation

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
    return generatePath(points, curveType);
  }, [name, currentKeyboardLayout, curveType, includeNumbers]); // Use name directly

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
  }, [name, currentKeyboardLayout, includeNumbers]); // Use name directly

  const handleLogin = async () => {
    await signInWithTwitter();
  };

  const handleLogout = async () => {
    await signOut();
    setDropdownOpen(false);
  };

  const handleClaim = async () => {
    if (!user || !name || !signaturePath) {
      return;
    }

    // Check if already claimed using React Query data
    if (existingSignature) {
      setClaimedBy(existingSignature.claimed_by_username);
      setClaimError(
        `Signature already claimed by @${existingSignature.claimed_by_username}`,
      );
      return;
    }

    setClaimError(null);

    // Use React Query mutation to claim the signature
    claimSignatureMutation.mutate(
      {
        name,
        signaturePath,
        strokeConfig,
        includeNumbers,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            setClaimedBy(user.username);
            setShowClaimPopup(true); // Show success popup
          } else if (result.error === "signature_already_claimed") {
            setClaimError("Signature already claimed");
          } else if (result.error === "user_already_claimed") {
            setClaimError(
              "You already claimed a signature. Only 1 signature per account.",
            );
          } else {
            setClaimError("Failed to claim signature. Please try again.");
          }
        },
        onError: () => {
          setClaimError("Failed to claim signature. Please try again.");
        },
      },
    );
  };

  const handleUnclaim = async () => {
    if (!user || !existingSignature?.claimed_by_username) {
      return;
    }

    setClaimError(null);

    // Use React Query mutation to claim the signature
    unclaimSignatureMutation.mutate(
      {
        name,
        username: existingSignature.claimed_by_username,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            setClaimedBy(null);
          } else {
            setClaimError("Failed to unclaim signature. Please try again.");
          }
        },
        onError: () => {
          setClaimError("Failed to unclaim signature. Please try again.");
        },
      },
    );
  };

  const handleTwitterRedirect = (username: string) => {
    window.open(`https://twitter.com/${username}`, "_blank");
  };

  // Export functions
  const exportSVG = () => {
    if (!signaturePath || !name) return;

    const height = includeNumbers ? 260 : 200;
    const gradients =
      strokeConfig.style === StrokeStyle.GRADIENT
        ? `<linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
           <stop offset="0%" style="stop-color:${strokeConfig.gradientStart};stop-opacity:1" />
           <stop offset="100%" style="stop-color:${strokeConfig.gradientEnd};stop-opacity:1" />
         </linearGradient>`
        : "";
    const strokeColor =
      strokeConfig.style === StrokeStyle.SOLID
        ? strokeConfig.color
        : "url(#pathGradient)";

    const svgContent = `<svg width="650" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>${gradients}</defs>
          <path d="${signaturePath}" stroke="${strokeColor}" stroke-width="${strokeConfig.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
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

    // Configure stroke
    ctx.lineWidth = strokeConfig.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Set stroke style based on configuration
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

  if (showClaimedPage) {
    return <ClaimedPage onBack={() => setShowClaimedPage(false)} user={user} />;
  }

  return (
    <div className="flex flex-col sm:items-center sm:justify-center max-sm:mx-auto max-sm:w-[28rem] sm:w-fit">
      {user ? (
        <motion.div
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -4, opacity: 0 }}
          transition={{ duration: 1, ease: [0.26, 1, 0.6, 1] }}
          className="absolute top-6 left-1/2 -translate-x-1/2"
        >
          <div className="inline-flex items-center gap-2 bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-4 py-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-yellow-400"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="m12 17.02.01-.02" />
            </svg>
            <p className="text-sm text-yellow-200 font-medium text-center">
              You can only claim 1 signature per account
            </p>
          </div>
        </motion.div>
      ) : null}

      <div className="absolute top-6 left-6 z-20">
        <div className="relative">
          <motion.div
            animate={{
              width: showSearchInput ? 200 : 36,
              transition: { duration: 0.3, ease: [0.6, 1, 0.26, 1] },
            }}
            className="flex items-center bg-neutral-900/50 border border-neutral-700/50 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setShowSearchInput(true)}
              className="p-2 text-neutral-400 hover:text-white transition-colors duration-150 flex-shrink-0 flex items-center justify-center"
              title="Search claimed signatures"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            <AnimatePresence>
              {showSearchInput && (
                <motion.input
                  ref={searchInputRef}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={(e) => {
                    // Don't close if clicking on a result
                    if (!e.relatedTarget?.closest(".search-results")) {
                      setTimeout(() => {
                        if (!searchQuery) {
                          setShowSearchInput(false);
                        }
                      }, 150);
                    }
                  }}
                  placeholder="Search signatures..."
                  className="bg-transparent text-white placeholder-neutral-500 px-0 py-2 text-sm outline-none flex-1 min-w-0"
                />
              )}
            </AnimatePresence>

            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  setShowSearchInput(false);
                }}
                className="p-1 mr-2 text-neutral-400 hover:text-white transition-colors flex-shrink-0"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </motion.button>
            )}
          </motion.div>

          <AnimatePresence>
            {(searchResults.length > 0 || searchQuery.trim()) &&
              showSearchInput && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="search-results absolute top-full left-0 mt-2 w-80 max-w-[90vw] sm:w-96 z-30"
                >
                  {searchQuery.trim() &&
                    searchQuery !== debouncedSearchQuery && (
                      <div className="px-4 py-3 text-center text-neutral-400 text-sm">
                        Searching...
                      </div>
                    )}
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((signature: ClaimedSignature) => (
                        <div
                          key={signature.id}
                          onClick={() => {
                            setSelectedSignature(signature);
                            setShowSearchInput(false);
                            setSearchQuery("");
                          }}
                          className="px-4 py-3 bg-neutral-900/90 backdrop-blur-sm border border-neutral-700/50 rounded-lg mb-2 hover:bg-neutral-800/90 cursor-pointer transition-colors duration-150"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-black rounded p-2 w-12 h-6 flex items-center justify-center flex-shrink-0">
                              <svg
                                width="48"
                                height="20"
                                viewBox="0 0 600 200"
                                className="w-full h-full"
                              >
                                <defs>
                                  {signature.stroke_config.style ===
                                    "gradient" && (
                                    <linearGradient
                                      id={`search-gradient-${signature.id}`}
                                      x1="0%"
                                      y1="0%"
                                      x2="100%"
                                      y2="0%"
                                    >
                                      <stop
                                        offset="0%"
                                        stopColor={
                                          signature.stroke_config.gradientStart
                                        }
                                        stopOpacity={1}
                                      />
                                      <stop
                                        offset="100%"
                                        stopColor={
                                          signature.stroke_config.gradientEnd
                                        }
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
                                      : `url(#search-gradient-${signature.id})`
                                  }
                                  strokeWidth={signature.stroke_config.width}
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white text-sm truncate">
                                {signature.name}
                              </h3>
                              <p className="text-xs text-neutral-400 truncate">
                                @{signature.claimed_by_username}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.trim() ? (
                    <div className="px-4 py-3 bg-neutral-900/90 backdrop-blur-sm border border-neutral-700/50 rounded-lg text-center">
                      <p className="text-neutral-400 text-sm">
                        No signatures found for &quot;{searchQuery}&quot;
                      </p>
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-neutral-900/90 backdrop-blur-sm border border-neutral-700/50 rounded-lg text-center">
                      <p className="text-neutral-400 text-sm">
                        Start typing to search signatures...
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-20">
        {!user ? (
          <button
            onClick={handleLogin}
            className="whitespace-nowrap text-white flex flex-row items-center gap-2 font-semibold cursor-pointer hover:bg-neutral-950 rounded-full bg-black border border-neutral-800/75 px-4 py-2 opacity-75 hover:opacity-100 duration-150 ease-out transition-opacity"
          >
            <XIcon width={20} height={20} className="fill-white" />
            Connect with X
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="whitespace-nowrap text-white flex flex-row items-center gap-2 font-semibold cursor-pointer hover:bg-neutral-950 rounded-full bg-black border border-neutral-800/75 p-2 pr-4 opacity-75 hover:opacity-100 duration-150 ease-out transition-opacity"
            >
              <img
                src={user.profilePic}
                alt={`${user.username} profile picture`}
                className="size-7 rounded-full"
              />

              {user.username}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: [0.26, 1, 0.6, 1] }}
                  className="absolute right-0  gap-1 top-full mt-2 bg-neutral-950 border border-neutral-800 rounded-lg p-2 min-w-[120px]"
                >
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowClaimedPage(true);
                    }}
                    className="whitespace-nowrap cursor-pointer block w-full text-left px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-all duration-150 hover:duration-50"
                  >
                    Claimed
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-red-400 cursor-pointer block w-full text-left px-3 py-2 text-sm hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-150 hover:duration-50"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <input
        autoFocus
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="max-sm:mt-14 placeholder-neutral-800 leading-[1] [&::placeholder]:duration-200 [&::placeholder]:transition-all focus:placeholder-neutral-600 tracking-wide text-4xl text-white bg-transparent duration-150 transition-all ease-out px-4 py-2 text-center outline-none"
      />

      <div className="relative mb-4 mt-8 max-sm:mt-0 max-sm:scale-70 max-sm:-ml-22">
        <div
          className={`relative transition-opacity ease-out ${
            name.length < 2
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

        <svg
          className="pointer-events-none absolute top-0 left-0"
          width="650"
          height={includeNumbers ? "260" : "200"}
          style={{ zIndex: 10 }}
        >
          <defs>
            {strokeConfig.style === StrokeStyle.GRADIENT && (
              <linearGradient
                id="pathGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor={strokeConfig.gradientStart}
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor={strokeConfig.gradientEnd}
                  stopOpacity={1}
                />
              </linearGradient>
            )}
          </defs>

          {signaturePath ? (
            <path
              d={signaturePath}
              stroke={
                strokeConfig.style === StrokeStyle.SOLID
                  ? strokeConfig.color
                  : "url(#pathGradient)"
              }
              strokeWidth={strokeConfig.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </svg>
      </div>

      <div
        className={`max-sm:w-[20rem] max-sm:mx-auto flex flex-col gap-2 sm:mt-8 transition-all ease-in-out ${name.length > 1 ? "opacity-100 translate-y-0 duration-1000" : "pointer-events-none opacity-0 translate-y-2 duration-150"}`}
      >
        {existingSignature?.claimed_by_username &&
        existingSignature?.claimed_by_username === user?.username ? (
          <button
            onClick={handleUnclaim}
            className="flex items-center justify-center gap-1 font-medium text-red-500 border border-red-700/50 px-3.5 py-1.5 bg-red-900/25 text-sm rounded-md hover:bg-red-900/30 cursor-pointer transition-all duration-100 ease-out hover:text-red-400"
          >
            Unclaim
          </button>
        ) : claimedBy ? (
          <div className="flex items-center justify-center gap-1 font-medium text-neutral-500 border border-neutral-700/50 px-3.5 py-1.5 bg-neutral-900/50 text-sm rounded-md">
            <span>Claimed by</span>
            <button
              onClick={() => handleTwitterRedirect(claimedBy)}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-100 cursor-pointer"
            >
              @{claimedBy}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClaim}
            disabled={!user || !name || !!claimedBy}
            className={`font-medium px-3.5 py-1.5 text-sm rounded-md text-center active:scale-98 transition-all duration-100 ease-out ${
              !user || !name || !!claimedBy
                ? "text-neutral-600 border border-neutral-800/50 bg-neutral-900/30 cursor-not-allowed"
                : "text-neutral-500 border border-neutral-700/50 bg-neutral-900/50 active:brightness-70 hover:brightness-85 cursor-pointer"
            }`}
          >
            {!user
              ? "Login to Claim"
              : !name
                ? "Enter Name"
                : claimedBy
                  ? "Already Claimed"
                  : "Claim Signature"}
          </button>
        )}

        <div className="grid grid-cols-2 gap-2 mt-4">
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

              {/* Color Style */}
              <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">
                Style
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.values(StrokeStyle).map((style) => (
                  <button
                    key={style}
                    onClick={() =>
                      setStrokeConfig((prev) => ({ ...prev, style }))
                    }
                    className={`px-3 py-1 text-xs rounded-full transition-all duration-150 ease-out cursor-pointer border ${
                      strokeConfig.style === style
                        ? "bg-white text-black font-medium border-white"
                        : "bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border-neutral-800"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>

              {/* Color Picker */}
              {strokeConfig.style === StrokeStyle.SOLID && (
                <>
                  <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">
                    Color
                  </p>
                  <ColorPicker
                    value={strokeConfig.color}
                    onChange={(color) =>
                      setStrokeConfig((prev) => ({ ...prev, color }))
                    }
                  />
                </>
              )}

              {/* Gradient Colors */}
              {strokeConfig.style === StrokeStyle.GRADIENT && (
                <>
                  <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">
                    Colors
                  </p>
                  <div className="flex items-center gap-2">
                    <ColorPicker
                      value={strokeConfig.gradientStart}
                      onChange={(color) =>
                        setStrokeConfig((prev) => ({
                          ...prev,
                          gradientStart: color,
                        }))
                      }
                    />
                    <ColorPicker
                      value={strokeConfig.gradientEnd}
                      onChange={(color) =>
                        setStrokeConfig((prev) => ({
                          ...prev,
                          gradientEnd: color,
                        }))
                      }
                    />
                  </div>
                </>
              )}

              {/* Stroke Width */}
              <p className="text-neutral-300 text-sm font-medium mr-8 mt-1">
                Width
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={strokeConfig.width}
                  onChange={(e) =>
                    setStrokeConfig((prev) => ({
                      ...prev,
                      width: parseInt(e.target.value),
                    }))
                  }
                  className="flex-1"
                />
                <span className="text-neutral-400 text-xs w-6">
                  {strokeConfig.width}px
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

      <AnimatePresence>
        {showClaimPopup && (
          <ClaimPopup
            isOpen={showClaimPopup}
            onClose={() => setShowClaimPopup(false)}
            name={name}
            signaturePath={signaturePath}
            strokeConfig={strokeConfig}
            includeNumbers={includeNumbers}
            user={user}
          />
        )}
      </AnimatePresence>

      <SignatureDetailModal
        signature={selectedSignature}
        isOpen={!!selectedSignature}
        onClose={() => setSelectedSignature(null)}
      />
    </div>
  );
};
