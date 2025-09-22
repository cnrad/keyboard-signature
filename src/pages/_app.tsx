import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Geist_Mono, Open_Sans } from "next/font/google";
import Navigation from "@/components/Navigation";
import { SessionProvider } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "sonner";

const sans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
  router,
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Toaster theme="dark" />
      <main
        className={`relative ${sans.variable} ${mono.variable} flex flex-col items-center w-full`}
      >
        <Navigation />
        <AnimatePresence mode="wait">
          <motion.div
            key={router.route}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{
              duration: 0.35,
              ease: [0.6, 1, 0.26, 1],
            }}
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </main>
    </SessionProvider>
  );
}
