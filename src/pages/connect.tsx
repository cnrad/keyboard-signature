import Head from "next/head";
import DigitalSignaturesLogo from "@/components/DigitalSignaturesLogo";
import { useRouter } from "next/router";
import { Button } from "@/components/Button";
import { ArrowRight, PenLineIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <div
        className={`w-full h-full flex flex-col items-center justify-center font-sans overflow-hidden overflow-y-auto p-24 text-white`}
      >
        <p className="font-medium mb-4">
          Connect your X account to get started:
        </p>

        <Button variant="black">Connect to X</Button>
      </div>
    </>
  );
}
