"use server";

import { createServerSupabaseClient } from "./auth";
import { StrokeConfig } from "@/util/constants";

export interface ClaimSignatureParams {
	name: string;
	signaturePath: string;
	strokeConfig: StrokeConfig;
	includeNumbers: boolean;
}

// For client-side use, we'll use the existing supabase client
// Server-side operations will be handled through API endpoints
export async function claimSignatureAction(params: ClaimSignatureParams) {
	// This function is now a client-side wrapper that calls the API
	const response = await fetch("/api/signatures/claim", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		const error = await response.json();
		return {
			success: false,
			error: error.message || "Failed to claim signature",
		};
	}

	const data = await response.json();
	return { success: true, data };
}

export async function getSignatureByNameAction(name: string) {
	// This function is now a client-side wrapper that calls the API
	const response = await fetch(`/api/signatures/${encodeURIComponent(name)}`);

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export async function getClaimedSignaturesAction() {
	// This function is now a client-side wrapper that calls the API
	const response = await fetch("/api/signatures");

	if (!response.ok) {
		return [];
	}

	return response.json();
}

export async function getUserClaimedSignaturesAction() {
	// This function is now a client-side wrapper that calls the API
	const response = await fetch("/api/signatures/user");

	if (!response.ok) {
		return [];
	}

	return response.json();
}
