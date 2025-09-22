// components/NFTMinter.tsx
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState } from "react";

export default function NFTMinter() {
  const { publicKey, signMessage } = useWallet();
  const [minting, setMinting] = useState(false);

  const mintNFT = async () => {
    if (!publicKey || !signMessage) return;

    setMinting(true);
    try {
      // Create a message to sign for verification
      const message = `Mint NFT request from ${publicKey.toString()} at ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);

      // Call your API
      const response = await fetch("/api/mint-nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPublicKey: publicKey.toString(),
          signature: Array.from(signature),
          message: message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("NFT minted! Transaction:", result.transactionHash);
        // Show success message to user
      } else {
        console.error("Minting failed:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setMinting(false);
    }
  };

  return (
    <div>
      <WalletMultiButton />
      {publicKey && (
        <button
          onClick={mintNFT}
          disabled={minting}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
        >
          {minting ? "Minting..." : "Mint NFT with $SIGN"}
        </button>
      )}
    </div>
  );
}
