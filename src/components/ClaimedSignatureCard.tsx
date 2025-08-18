interface ClaimedSignatureProps {
  signatureName: string;
  signatureDate: Date;
  twitterLink: string;
}

export const ClaimedSignatureCard = ({
  signatureName,
  signatureDate,
}: ClaimedSignatureProps) => {
  return (
    <div className="w-full p-3 rounded-2xl border border-neutral-800 bg-neutral-950 grid grid-cols-2 gap-4">
      <img
        src="https://pbs.twimg.com/media/GymxOd2WoAAK4yY?format=png"
        alt="Signature"
        className="rounded-md w-full border border-neutral-900/50"
      />

      <div className="flex flex-col gap-2">
        <p className="text-neutral-200 font-semibold text-lg">
          {signatureName}
        </p>
        <p className="text-neutral-200 text-sm leading-[1]">
          <span className="text-neutral-600 font-medium">Claimed</span> August
          18, 2025
        </p>

        <button className="text-neutral-400 text-sm font-medium hover:text-white mt-auto w-full px-2 py-1 rounded-md border-neutral-900 bg-black border hover:border-neutral-800 transition-all duration-150 ease-out active:scale-98 cursor-pointer hover:bg-neutral-950">
          View on X
        </button>
      </div>
    </div>
  );
};
