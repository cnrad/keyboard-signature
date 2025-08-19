import { GetServerSideProps } from "next";
import { supabase } from "@/lib/supabase";
import { ClaimedSignature } from "@/hooks/useSignatures";
import Head from "next/head";
import Link from "next/link";
import { XIcon } from "@/components/XIcon";

interface SignaturePageProps {
  signature: ClaimedSignature | null;
  error?: string;
}

export default function SignaturePage({
  signature,
  error,
}: SignaturePageProps) {
  if (error || !signature) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Signature Not Found
          </h1>
          <p className="text-neutral-400 mb-6">
            The signature you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:brightness-85 transition-all duration-150"
          >
            Create Your Signature
          </Link>
        </div>
      </div>
    );
  }

  const signatureImageUrl = `https://signature.cnrad.dev/api/signature-image/${signature.name}`;

  return (
    <>
      <Head>
        <title>{signature.name} - Digital Signature</title>
        <meta
          name="description"
          content={`Digital signature for ${signature.name} created on Digital Signatures`}
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://signature.cnrad.dev/${signature.name.toLowerCase()}`}
        />
        <meta
          property="og:title"
          content={`${signature.name} - Digital Signature`}
        />
        <meta
          property="og:description"
          content={`Digital signature for ${signature.name} created on Digital Signatures`}
        />
        <meta property="og:image" content={signatureImageUrl} />
        <meta property="og:image:width" content="650" />
        <meta
          property="og:image:height"
          content={signature.include_numbers ? "260" : "200"}
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content={`https://signature.cnrad.dev/${signature.name.toLowerCase()}`}
        />
        <meta
          property="twitter:title"
          content={`${signature.name} - Digital Signature`}
        />
        <meta
          property="twitter:description"
          content={`Digital signature for ${signature.name} created on Digital Signatures`}
        />
        <meta property="twitter:image" content={signatureImageUrl} />
      </Head>

      <div className="min-h-screen w-screen bg-neutral-950/50 flex flex-col items-center sm:justify-center p-4 max-sm:py-16">
        <a
          href={`https://x.com/${signature.claimed_by_username}`}
          className="opacity-75 hover:opacity-100 hover:duration-150 transition-all duration-300 ease-out cursor-pointer px-3 py-0.5 shadow-[0_5px_4px_-4px_var(--color-gray-900)] hover:shadow-[0_4px_6px_-4px_var(--color-gray-600)] bg-gradient-to-b from-gray-600 via-gray-800 to-gray-700 border-gray-600 via-30% rounded-full border text-gray-400 font-semibold mb-4"
        >
          Claimed by{" "}
          <span className="text-gray-200 hover:text-white cursor-pointer transition-colors duration-100 ease-out">
            @{signature.claimed_by_username}
          </span>{" "}
          on {new Date(signature.created_at).toLocaleDateString()}
        </a>

        <h1 className="text-4xl font-bold text-white text-center mb-6">
          {signature.name}
        </h1>

        <div className="bg-black rounded-lg py-8 flex items-center justify-center border border-neutral-800">
          <svg
            width="650"
            height={signature.include_numbers ? 260 : 200}
            viewBox={`0 0 650 ${signature.include_numbers ? 260 : 200}`}
            className="max-w-full max-h-[300px]"
          >
            <defs>
              {signature.stroke_config.style === "gradient" && (
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
                  : "url(#gradient)"
              }
              strokeWidth={signature.stroke_config.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex gap-4 mt-8 max-sm:grid max-sm:flex-col max-sm:w-full max-sm:gap-2">
          <Link
            href="/"
            className="justify-center max-sm:w-full flex items-center bg-white text-black px-5 py-2.5 rounded-lg font-semibold  hover:brightness-85 transition-all duration-150"
          >
            Create Your Own
          </Link>
          <button
            onClick={() => {
              const tweetText = `Check out this digital signature for "${signature.name}"!\n\n#DigitalSignature\n\nhttps://signature.cnrad.dev/${signature.name.toLowerCase()}`;
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
              window.open(twitterUrl, "_blank");
            }}
            className="justify-center max-sm:w-full cursor-pointer flex items-center font-semibold  whitespace-nowrap gap-2 bg-neutral-950 text-white px-5 py-2.5 border border-neutral-800 hover:border-neutral-700 rounded-lg hover:bg-neutral-900 transition-all duration-150"
          >
            <XIcon className="fill-white shrink-0 size-6" />
            Share on X
          </button>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { signature: signatureName } = context.params!;

  if (!signatureName || typeof signatureName !== "string") {
    return {
      props: {
        signature: null,
        error: "Invalid signature name",
      },
    };
  }

  try {
    const { data, error } = await supabase
      .from("claimed_signatures")
      .select("*")
      .eq("name", signatureName.toUpperCase())
      .maybeSingle();

    if (error || !data) {
      return {
        props: {
          signature: null,
          error: "Signature not found",
        },
      };
    }

    return {
      props: {
        signature: data,
      },
    };
  } catch (error) {
    console.error("Error fetching signature:", error);
    return {
      props: {
        signature: null,
        error: "Failed to fetch signature",
      },
    };
  }
};
