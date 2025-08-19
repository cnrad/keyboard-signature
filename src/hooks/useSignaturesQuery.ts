import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  claimSignatureAction,
  getSignatureByNameAction,
  getClaimedSignaturesAction,
  getUserClaimedSignaturesAction,
  unclaimSignatureAction,
} from "@/lib/actions";
import { StrokeConfig } from "@/util/constants";
import type { ClaimedSignature } from "@/hooks/useSignatures";
import { UnclaimSignatureParams } from "@/pages/api/signatures/unclaim";

export interface ClaimSignatureParams {
  name: string;
  signaturePath: string;
  strokeConfig: StrokeConfig;
  includeNumbers: boolean;
}

// Query keys
export const signatureKeys = {
  all: ["signatures"] as const,
  lists: () => [...signatureKeys.all, "list"] as const,
  list: (filters: string) => [...signatureKeys.lists(), { filters }] as const,
  details: () => [...signatureKeys.all, "detail"] as const,
  detail: (name: string) => [...signatureKeys.details(), name] as const,
  user: () => [...signatureKeys.all, "user"] as const,
};

// Hook to get all claimed signatures
export const useClaimedSignatures = () => {
  return useQuery<ClaimedSignature[]>({
    queryKey: signatureKeys.lists(),
    queryFn: getClaimedSignaturesAction,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get signature by name
export const useSignatureByName = (name: string) => {
  return useQuery<ClaimedSignature | null>({
    queryKey: signatureKeys.detail(name),
    queryFn: () => getSignatureByNameAction(name),
    enabled: !!name && name.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get user's claimed signatures
export const useUserClaimedSignatures = () => {
  return useQuery<ClaimedSignature[]>({
    queryKey: signatureKeys.user(),
    queryFn: getUserClaimedSignaturesAction,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to claim a signature
export const useClaimSignature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ClaimSignatureParams) => claimSignatureAction(params),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries({ queryKey: signatureKeys.lists() });
        queryClient.invalidateQueries({ queryKey: signatureKeys.user() });
        queryClient.invalidateQueries({ queryKey: signatureKeys.details() });
      }
    },
    onError: (error) => {
      console.error("Error claiming signature:", error);
    },
  });
};

// Hook to claim a signature
export const useUnclaimSignature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UnclaimSignatureParams) =>
      unclaimSignatureAction(params),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries({ queryKey: signatureKeys.lists() });
        queryClient.invalidateQueries({ queryKey: signatureKeys.user() });
        queryClient.invalidateQueries({ queryKey: signatureKeys.details() });
      }
    },
    onError: (error) => {
      console.error("Error claiming signature:", error);
    },
  });
};

// Hook to search signatures (client-side filtering)
export const useSearchSignatures = (query: string) => {
  const { data: signatures = [], isLoading } = useClaimedSignatures();

  const searchResults = query.trim()
    ? signatures.filter(
        (sig: ClaimedSignature) =>
          sig.name.toLowerCase().includes(query.toLowerCase().trim()) ||
          sig.claimed_by_username
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
      )
    : [];

  return {
    searchResults: searchResults.slice(0, 4), // Limit to 4 results
    isLoading,
  };
};
