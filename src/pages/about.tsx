import { toast } from "sonner";

export default function About() {
  return (
    <div className="flex flex-col max-w-xl gap-4 mt-10">
      <h2 className="text-white text-2xl font-semibold">
        About{" "}
        <span className="font-mono py-0.5 px-1 text-neutral-300 rounded-md bg-neutral-900">
          $SIGN
        </span>
      </h2>

      <p className="text-white/50 hover:text-white/75 transition-colors duration-500 ease-out text-sm tracking-[0.1] cursor-default">
        we live in an era where digital identity is fragmented across countless
        platforms, wallets, and ecosystems.
      </p>

      <p className="text-white/50 hover:text-white/75 transition-colors duration-500 ease-out text-sm tracking-[0.1] cursor-default">
        <span className="font-medium text-white/75">digital signatures</span>{" "}
        create a verifiable bridge between your web2 presence and web3 identity
        through unique collectibles. it's a digital credential that serves as
        cryptographic proof of identity across both traditional social platforms
        and blockchain networks. by minting your signature, you establish a
        portable, tamper-proof connection between your twitter handle and wallet
        address, eliminating repeated verification friction.
      </p>

      <p className="text-white/50 hover:text-white/75 transition-colors duration-500 ease-out text-sm tracking-[0.1] cursor-default">
        $SIGN is powerful because of our trust-through-stake model: higher
        verification tiers require greater token commitment. this deters bad
        actors but rewards authentic users with credibility. when projects see a
        gold-bordered signature in your wallet, they immediately understand
        you've invested meaningfully in your reputation - no additional info
        needed.
      </p>
      <p className="text-white/50 hover:text-white/75 transition-colors duration-500 ease-out text-sm tracking-[0.1] cursor-default">
        this isn't just another nft collection; we're building infrastructure
        for portable digital reputation. your signature becomes a universal
        identity that works across protocols, communities, and applications.
        your digital identity for a digital age.
      </p>

      <div className="flex flex-col gap-1 w-full text-sm mt-4">
        <div
          className="flex justify-between items-center cursor-pointer group"
          onClick={() => {
            window.navigator.clipboard.writeText(
              "GjbLHUmyUo6JFczvaTbsj9p1LjsXmvR8Vk9gRPNLBAGS"
            );
            toast.success("Contract Address copied to clipboard.");
          }}
        >
          <p className="text-white font-semibold whitespace-nowrap">
            Contract Address (CA)
          </p>
          <p className="text-white/50 group-hover:text-white group-hover:font-medium transition-all duration-150 ease-out">
            GjbLHUmyUo6JFczvaTbsj9p1LjsXmvR8Vk9gRPNLBAGS
          </p>
        </div>
        <a
          href="https://x.com/signaturesdev"
          className="flex justify-between items-center cursor-pointer group"
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="text-white font-semibold whitespace-nowrap">
            X / Twitter
          </p>
          <p className="text-white/50 group-hover:text-white group-hover:font-medium transition-all duration-150 ease-out">
            @signaturesdev
          </p>
        </a>
        <a
          href="https://x.com/notcnrad"
          className="flex justify-between items-center cursor-pointer group"
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="text-white font-semibold whitespace-nowrap">Creator</p>
          <p className="text-white/50 group-hover:text-white group-hover:font-medium transition-all duration-150 ease-out">
            @notcnrad
          </p>
        </a>
      </div>
    </div>
  );
}
