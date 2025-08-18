import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { useSignatures } from "@/hooks/useSignatures";
import type { ClaimedSignature } from "@/hooks/useSignatures";

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSignatureClick: (signature: ClaimedSignature) => void;
}

export const SearchDropdown = ({ isOpen, onClose, onSignatureClick }: SearchDropdownProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ClaimedSignature[]>([]);
  const { searchSignatures } = useSignatures();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      const results = searchSignatures(searchQuery);
      setSearchResults(results.slice(0, 5)); // Limit to 5 results for dropdown
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchSignatures]);

  const handleTwitterRedirect = (username: string) => {
    window.open(`https://twitter.com/${username}`, '_blank');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && event.target instanceof Element && !event.target.closest('.search-dropdown')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="search-dropdown relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.6, 1, 0.26, 1] }}
            className="absolute top-full left-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg w-80 max-w-[90vw] sm:w-96 z-30 overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-4 border-b border-neutral-700">
              <div className="relative">
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                >
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search signatures or usernames..."
                  className="w-full bg-neutral-800 border border-neutral-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors duration-150"
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-64 overflow-y-auto">
              {searchQuery && searchResults.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-neutral-400 text-sm">No signatures found</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((signature) => (
                    <motion.div
                      key={signature.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-4 py-3 hover:bg-neutral-800/50 cursor-pointer transition-colors duration-150"
                      onClick={() => onSignatureClick(signature)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-black rounded p-2 w-16 h-8 flex items-center justify-center flex-shrink-0">
                          <svg width="60" height="24" viewBox="0 0 600 200" className="w-full h-full">
                            <defs>
                              {signature.stroke_config.style === 'gradient' && (
                                <linearGradient id={`search-gradient-${signature.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor={signature.stroke_config.gradientStart} stopOpacity={1} />
                                  <stop offset="100%" stopColor={signature.stroke_config.gradientEnd} stopOpacity={1} />
                                </linearGradient>
                              )}
                            </defs>
                            <path
                              d={signature.signature_path}
                              stroke={signature.stroke_config.style === 'solid' ? signature.stroke_config.color : `url(#search-gradient-${signature.id})`}
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
                            Claimed by{" "}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTwitterRedirect(signature.claimed_by_username);
                              }}
                              className="text-blue-400 hover:text-blue-300 transition-colors duration-100"
                            >
                              @{signature.claimed_by_username}
                            </button>
                          </p>
                          <p className="text-xs text-neutral-500">
                            {new Date(signature.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : !searchQuery ? (
                <div className="p-4 text-center">
                  <p className="text-neutral-400 text-sm">Start typing to search...</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};