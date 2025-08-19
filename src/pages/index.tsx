import Head from "next/head";
import { KeyboardSignature } from "@/components/KeyboardSignature";

export default function Home() {
  return (
    <>
      <Head>
        <title>Digitized Signatures</title>
      </Head>
      <div
        className={`w-screen h-screen flex flex-col sm:justify-center sm:items-center font-sans py-12 overflow-x-auto overflow-y-auto`}
      >
        <KeyboardSignature />
      </div>
    </>
  );
}
