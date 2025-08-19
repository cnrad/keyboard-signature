import { useState, useEffect, useCallback } from "react";
import {
	claimSignatureAction,
	getClaimedSignaturesAction,
	getUserClaimedSignaturesAction,
	getSignatureByNameAction,
} from "@/lib/actions";
import { StrokeConfig } from "@/util/constants";

export interface ClaimedSignature {
	id: string;
	name: string;
	signature_path: string;
	claimed_by_user_id: string;
	claimed_by_username: string;
	claimed_by_avatar: string | null;
	created_at: string;
	stroke_config: StrokeConfig;
	include_numbers: boolean;
}

export const useSignatures = () => {
	const [claimedSignatures, setClaimedSignatures] = useState<
		ClaimedSignature[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);

	const fetchClaimedSignatures = useCallback(async () => {
		try {
			const data = await getClaimedSignaturesAction();
			setClaimedSignatures(data);
		} catch (error) {
			console.error("Error fetching signatures:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const claimSignature = async (
		name: string,
		signaturePath: string,
		strokeConfig: StrokeConfig,
		includeNumbers: boolean,
		userId: string,
		username: string,
		avatar: string | null,
	) => {
		try {
			const result = await claimSignatureAction({
				name,
				signaturePath,
				strokeConfig,
				includeNumbers,
			});

			if (!result.success) {
				return {
					success: false,
					error: result.error,
				};
			}

			// Add to local state
			if (result.data) {
				setClaimedSignatures((prev) => [
					result.data as ClaimedSignature,
					...prev,
				]);
			}

			return { success: true, data: result.data };
		} catch (error) {
			console.error("Error claiming signature:", error);
			return { success: false, error: "claim_failed" };
		}
	};

	const getSignatureByName = async (name: string) => {
		try {
			const data = await getSignatureByNameAction(name);
			return data;
		} catch (error) {
			console.error("Error fetching signature:", error);
			return null;
		}
	};

	const getUserClaimedSignatures = (userId: string) => {
		return claimedSignatures.filter((sig) => sig.claimed_by_user_id === userId);
	};

	const searchSignatures = (query: string) => {
		if (!query.trim()) return claimedSignatures;

		const searchTerm = query.toLowerCase().trim();
		return claimedSignatures.filter(
			(sig) =>
				sig.name.toLowerCase().includes(searchTerm) ||
				sig.claimed_by_username.toLowerCase().includes(searchTerm),
		);
	};

	useEffect(() => {
		fetchClaimedSignatures();
	}, [fetchClaimedSignatures]);

	return {
		claimedSignatures,
		isLoading,
		claimSignature,
		getSignatureByName,
		getUserClaimedSignatures,
		searchSignatures,
		fetchClaimedSignatures,
	};
};
