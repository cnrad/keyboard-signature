import { getSignatureByNameAction } from "@/lib/actions";
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const name = url.pathname.split("/").pop();

		// Validate and sanitize input
		if (!name || typeof name !== "string") {
			return new Response(JSON.stringify({ error: "Invalid signature name" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Sanitize name - only allow alphanumeric characters and spaces
		const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
		if (!sanitizedName) {
			return new Response(JSON.stringify({ error: "Invalid signature name" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Get signature data
		const signature = await getSignatureByNameAction(sanitizedName);

		if (!signature) {
			return new Response(JSON.stringify({ error: "Signature not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			});
		}

		const height = signature.include_numbers ? 260 : 200;

		// Generate the image using Vercel OG
		return new ImageResponse(
			<div
				style={{
					width: 650,
					height,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#000000",
					position: "relative",
				}}
			>
				<svg
					width="650"
					height={height.toString()}
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>Signature for {sanitizedName}</title>
					<rect width="650" height={height.toString()} fill="#000000" />
					{signature.stroke_config.style === "gradient" && (
						<defs>
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
						</defs>
					)}
					<path
						d={signature.signature_path}
						stroke={
							signature.stroke_config.style === "solid"
								? signature.stroke_config.color
								: "url(#gradient)"
						}
						strokeWidth={signature.stroke_config.width}
						strokeLinecap="round"
						strokeLinejoin="round"
						fill="none"
					/>
				</svg>
			</div>,
			{
				width: 650,
				height,
			},
		);
	} catch (error) {
		console.error("Error generating signature image:", error);
		return new Response(JSON.stringify({ error: "Failed to generate image" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
