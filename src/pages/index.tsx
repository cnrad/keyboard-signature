import { Geist_Mono, Open_Sans } from "next/font/google";
import Head from "next/head";
import { KeyboardSignature } from "@/components/KeyboardSignature";

const sans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Digitized Signatures</title>
      </Head>
      <div
        className={`w-screen h-screen flex flex-col sm:items-center sm:justify-center ${sans.variable} ${mono.variable} font-sans py-10 overflow-x-auto overflow-y-auto`}
      >
        <KeyboardSignature />
      </div>
    </>
  );
}
