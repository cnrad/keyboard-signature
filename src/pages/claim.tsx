import { Button } from "@/components/Button";
import { signIn, useSession } from "next-auth/react";
import { SignatureDrawing } from "@/components/SignatureDrawing";
import {
  DEFAULT_OPTIONS,
  SignatureOptions,
} from "@/components/SignatureOptions";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/util/cn";
import NFTMinter from "@/components/NFTMinter";

export default function Home() {
  const { data: session, status } = useSession();
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    // Enable numbers if name contains digits
    if (/\d/.test(session?.user?.name || "")) {
      setOptions((prev) => ({
        ...prev,
        includeNumbers: true,
      }));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsSticky(scrollY > 200); // Adjust 200px to whatever threshold you want
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`relative w-full h-full flex flex-col items-center justify-center font-sans py-14 px-24 text-white`}
      >
        {status === "unauthenticated" ? (
          <>
            <p className="font-medium mb-4">
              Connect your X account to get started:
            </p>
            <Button variant="black" onClick={() => signIn("twitter")}>
              Connect to X
            </Button>
          </>
        ) : (
          <>
            <p className="font-medium text-white/80 mb-1">
              Your digital signature is below:
            </p>

            <p className="text-4xl font-medium text-white mb-8">
              {session?.user?.name}
            </p>

            <div
              className={cn(
                "max-w-2xl sticky top-16 transition-transform duration-300 ease-in-out scale-100 origin-top z-[105]",
                { "scale-65": isSticky }
              )}
            >
              <SignatureDrawing
                name={session?.user?.name || ""}
                options={options}
                className={cn(
                  "transition-shadow shadow-2xl shadow-transparent duration-150 ease-out",
                  {
                    "shadow-black/50": isSticky,
                  }
                )}
              />
            </div>

            <Button variant="blue" outerClassName="mb-8 w-full max-w-md">
              Mint Signature
            </Button>

            <NFTMinter />

            <p className="max-w-2xl text-white/50 text-center mb-4 text-sm">
              customize your signature and make it your own - when you're ready,
              press 'Mint Signature'.
            </p>

            <SignatureOptions
              options={options}
              setOptions={setOptions}
              className="w-full max-w-2xl mb-6"
            />
          </>
        )}
      </div>
    </>
  );
}
