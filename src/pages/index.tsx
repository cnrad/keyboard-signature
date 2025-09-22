import Head from "next/head";
import { useRouter } from "next/router";
import { Button } from "@/components/Button";
import { ArrowRight, PenLineIcon } from "lucide-react";
import { motion } from "motion/react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  if (router.query.authed) router.push("/claim");

  return (
    <>
      <Head>
        <title>Digitized Signatures</title>
      </Head>
      <div
        className={`w-full h-full flex flex-col items-center justify-center font-sans overflow-hidden overflow-y-auto p-24`}
      >
        <motion.div
          initial={{ opacity: 0, y: 2, scale: 1.05 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.75, ease: [0.6, 1, 0.26, 1] }}
          className="flex flex-col items-center"
        >
          <motion.video
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.6, 1, 0.26, 1], delay: 0.1 }}
            className="max-w-xl ml-4 pointer-events-none -z-1"
            autoPlay
            muted
            preload="auto"
            controls={false}
          >
            <source src="/signatures_intro.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </motion.video>

          <span className="text-sm font-bold text-neutral-500 uppercase">
            Digital Signatures
          </span>

          <h1 className="text-6xl pb-2 text-white font-semibold -mt-1 mb-2">
            signatures.dev
          </h1>
          <p className="text-lg text-white/65 -mt-1 text-center max-w-md">
            your digital identity for a digital future.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              ease: [0.6, 1, 0.26, 1],
              delay: 0.25,
            }}
            className="mt-10 flex flex-col gap-2 w-[20rem]"
          >
            <Button
              variant="blue"
              className="w-full"
              outerClassName="hover:shadow-[0_0_10px_-1px_var(--tw-shadow-color)] shadow-blue-600/50 shadow-none rounded-xl"
              onClick={() => {
                if (session) {
                  router.push("/claim");
                } else {
                  signIn("twitter", {
                    callbackUrl: "/?authed=true",
                  });
                }
              }}
            >
              Claim Signature
              <PenLineIcon size={18} className="-ml-0.5" />
            </Button>

            <Button
              variant="black"
              className="w-full"
              onClick={() => router.push("/playground")}
            >
              Explore Playground
              <ArrowRight
                size={18}
                className="text-neutral-500 group-hover:text-neutral-300 duration-150 ease-out transition-colors -ml-0.5"
              />
            </Button>

            <Link
              href="/about"
              className="uppercase group flex flex-row items-center gap-1 justify-center w-full text-neutral-600 hover:text-neutral-400 duration-150 ease-out transition-colors mt-1 text-sm font-semibold font-mono tracking-[0.28]"
            >
              About $SIGN
              <ArrowRight
                size={16}
                className="text-neutral-600 opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-4 group-hover:text-neutral-400 duration-150 ease-out transition-all "
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
