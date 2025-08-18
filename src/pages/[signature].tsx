import { GetServerSideProps } from 'next';
import { supabase } from '@/lib/supabase';
import { ClaimedSignature } from '@/hooks/useSignatures';
import Head from 'next/head';

interface SignaturePageProps {
  signature: ClaimedSignature | null;
  error?: string;
}

export default function SignaturePage({ signature, error }: SignaturePageProps) {
  if (error || !signature) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Signature Not Found</h1>
          <p className="text-neutral-400 mb-6">The signature you're looking for doesn't exist.</p>
          <a 
            href="/" 
            className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:brightness-85 transition-all duration-150"
          >
            Create Your Signature
          </a>
        </div>
      </div>
    );
  }

  const signatureImageUrl = `https://signature.cnrad.dev/api/signature-image/${signature.name}`;

  return (
    <>
      <Head>
        <title>{signature.name} - Digital Signature</title>
        <meta name="description" content={`Digital signature for ${signature.name} created on Keyboard Signature`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://signature.cnrad.dev/${signature.name.toLowerCase()}`} />
        <meta property="og:title" content={`${signature.name} - Digital Signature`} />
        <meta property="og:description" content={`Digital signature for ${signature.name} created on Keyboard Signature`} />
        <meta property="og:image" content={signatureImageUrl} />
        <meta property="og:image:width" content="650" />
        <meta property="og:image:height" content={signature.include_numbers ? "260" : "200"} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://signature.cnrad.dev/${signature.name.toLowerCase()}`} />
        <meta property="twitter:title" content={`${signature.name} - Digital Signature`} />
        <meta property="twitter:description" content={`Digital signature for ${signature.name} created on Keyboard Signature`} />
        <meta property="twitter:image" content={signatureImageUrl} />
      </Head>
      
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{signature.name}</h1>
          <p className="text-neutral-400">
            Claimed by <span className="text-blue-400">@{signature.claimed_by_username}</span> on{' '}
            {new Date(signature.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-8">
          <div className="bg-black rounded-lg p-8 flex items-center justify-center">
            <svg 
              width="650" 
              height={signature.include_numbers ? 260 : 200} 
              viewBox={`0 0 650 ${signature.include_numbers ? 260 : 200}`} 
              className="max-w-full max-h-[300px]"
            >
              <defs>
                {signature.stroke_config.style === 'gradient' && (
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={signature.stroke_config.gradientStart} stopOpacity={1} />
                    <stop offset="100%" stopColor={signature.stroke_config.gradientEnd} stopOpacity={1} />
                  </linearGradient>
                )}
              </defs>
              <path
                d={signature.signature_path}
                stroke={signature.stroke_config.style === 'solid' ? signature.stroke_config.color : 'url(#gradient)'}
                strokeWidth={signature.stroke_config.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="flex gap-4">
          <a 
            href="/" 
            className="bg-white text-black px-6 py-3 rounded-md text-sm font-medium hover:brightness-85 transition-all duration-150"
          >
            Create Your Signature
          </a>
          <button
            onClick={() => {
              const tweetText = `Check out this digital signature for "${signature.name}"!\n\n#DigitalSignature\n\nhttps://signature.cnrad.dev/${signature.name.toLowerCase()}`;
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
              window.open(twitterUrl, '_blank');
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-all duration-150"
          >
            Share on Twitter
          </button>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { signature: signatureName } = context.params!;
  
  if (!signatureName || typeof signatureName !== 'string') {
    return {
      props: {
        signature: null,
        error: 'Invalid signature name'
      }
    };
  }

  try {
    const { data, error } = await supabase
      .from('claimed_signatures')
      .select('*')
      .eq('name', signatureName.toUpperCase())
      .single();

    if (error || !data) {
      return {
        props: {
          signature: null,
          error: 'Signature not found'
        }
      };
    }

    return {
      props: {
        signature: data
      }
    };
  } catch (error) {
    console.error('Error fetching signature:', error);
    return {
      props: {
        signature: null,
        error: 'Failed to fetch signature'
      }
    };
  }
};
