import Link from "next/link";
import DigitalSignaturesLogo from "./DigitalSignaturesLogo";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./Button";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { XIcon } from "./XIcon";

export default function Navigation() {
  const { data: session } = useSession();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <nav className="z-[100] bg-black sticky top-0 w-full px-8 flex flex-row items-center justify-between gap-4 h-14 border-b border-b-transparent transition-colors duration-400 ease-out hover:border-b-neutral-900">
      <Link
        href="/"
        className="text-white font-semibold hover:brightness-90 duration-100 ease-out transition-all"
      >
        Digital Signatures.
      </Link>

      <a
        href="https://bags.fm/GjbLHUmyUo6JFczvaTbsj9p1LjsXmvR8Vk9gRPNLBAGS"
        rel="noreferrer noopener"
        className="group absolute hover:text-white left-1/2 flex flex-col items-center -translate-x-1/2 text-white/65 font-semibold hover:brightness-90 duration-100 ease-out transition-all"
      >
        $SIGN
        <span className="select-none group-hover:select-auto transition-all duration-150 ease-out -mt-4 opacity-0 group-hover:opacity-100  group-hover:mt-0 text-white/25 font-normal text-xs">
          GjbLHUmyUo6JFczvaTbsj9p1LjsXmvR8Vk9gRPNLBAGS
        </span>
      </a>

      <div className="flex flex-row items-center gap-8 ml-auto">
        <Link
          href="/claim"
          className="font-medium text-neutral-500 hover:text-neutral-200 duration-100 ease-out transition-colors"
        >
          Claim
        </Link>
        <Link
          href="/playground"
          className="font-medium text-neutral-500 hover:text-neutral-200 duration-100 ease-out transition-colors"
        >
          Playground
        </Link>
        <Link
          href="/about"
          className="font-medium text-neutral-500 hover:text-neutral-200 duration-100 ease-out transition-colors"
        >
          About
        </Link>

        {session?.user ? (
          <>
            <button
              onClick={() => setUserDropdownOpen((p) => !p)}
              className="relative p-1 border border-neutral-800 rounded-full flex items-center justify-center gap-2 hover:bg-neutral-900 cursor-pointer transition-colors duration-150 ease-out"
            >
              {session.user.image ? (
                <img
                  src={session.user.image}
                  className="size-6 shrink-0 rounded-full"
                />
              ) : null}

              <p className="text-white font-medium pr-2">{session.user.name}</p>
            </button>

            <AnimatePresence>
              {userDropdownOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: [0.26, 1, 0.6, 1] }}
                  className="absolute right-8 top-12 bg-neutral-950 border border-neutral-800 rounded-lg p-1 min-w-[120px]"
                >
                  <button
                    onClick={() => signOut()}
                    className="text-red-400 cursor-pointer block w-full text-left px-3 py-2 text-sm hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all duration-150 hover:duration-50"
                  >
                    Logout
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </>
        ) : (
          <button
            onClick={() => signIn("twitter")}
            className="relative py-1.5 px-4 font-semibold text-white/50 hover:text-white border border-neutral-800 rounded-full flex items-center justify-center gap-1.5 hover:bg-neutral-900 cursor-pointer transition-colors duration-150 ease-out"
          >
            Connect to <XIcon className="size-4 shrink-0 fill-current" />
          </button>
        )}
      </div>
    </nav>
  );
}
//
//
//
// UX:
// have them type a secret phrase that only they know
// that will generate randomness to move the coordinates of the keys around by a SMALL distance radius
// then that signature will be unique in the sense that all points have been moved a tiny bit
//
// how do we guarantee this is unique?
// - the signatures themselves should be unique as we are connecting it to twitter
// signatures with only a couple characters in them?
//
//
//
// can people have multiple signatures?
// - maybe in the future - will need a way to differentiate between platforms?
//
//
// variations:
// - gradients/color
// - stroke dash-array (solid, dashed, dotted)
// - style (bezier, straight, etc)
//
// should cost more $SIGN if choosing upgraded styles
//
//
//
//
