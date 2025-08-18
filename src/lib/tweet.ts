const generateTweetText = (name: string) => {
	const baseText = `Just claimed my digital signature for "${name}"!`;
	const hashTags =
		"#DigitalSignature ca: GjbLHUmyUo6JFczvaTbsj9p1LjsXmvR8Vk9gRPNLBAGS";
	const signatureUrl = `https://signature.cnrad.dev/${name.toLowerCase()}`;
	return `${baseText}\n\n${hashTags}\n\n${signatureUrl}`;
};

export const handleTweet = (name: string) => {
	const tweetText = encodeURIComponent(generateTweetText(name));
	const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
	window.open(twitterUrl, "_blank");
};
