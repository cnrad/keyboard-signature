import { NextApiRequest, NextApiResponse } from "next";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/auth";
import { StrokeConfig } from "@/util/constants";

export interface ClaimSignatureParams {
  name: string;
  signaturePath: string;
  strokeConfig: StrokeConfig;
  includeNumbers: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, signaturePath, strokeConfig, includeNumbers } =
      req.body as ClaimSignatureParams;

    // Validate input
    if (!name || !signaturePath || !strokeConfig) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Sanitize name - only allow alphanumeric characters and spaces
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    if (!sanitizedName) {
      return res.status(400).json({ error: "Invalid signature name" });
    }

    // First, authenticate the user using the client-side client
    const userClient = await createServerSupabaseClient(req, res);
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Use service role client for database operations (bypasses RLS)
    const serviceClient = createServiceSupabaseClient();

    // Check if signature is already claimed
    const { data: existingClaim, error: checkError } = await serviceClient
      .from("claimed_signatures")
      .select("*")
      .eq("name", sanitizedName.toUpperCase())
      .limit(1)
      .maybeSingle();

    if (checkError) {
      return res.status(500).json({ error: "Failed to check existing claims" });
    }

    if (existingClaim) {
      return res.status(409).json({ error: "signature_already_claimed" });
    }

    // Check if user already has a claimed signature (one per account limit)
    const { data: userExistingClaim, error: userCheckError } =
      await serviceClient
        .from("claimed_signatures")
        .select("*")
        .eq("claimed_by_user_id", user.id)
        .limit(1)
        .maybeSingle();

    if (userCheckError) {
      return res.status(500).json({ error: "Failed to check user claims" });
    }

    // i (conrad) get two signatures because one is for my girlfriend :)
    if (userExistingClaim && user.user_metadata.user_name !== "notcnrad") {
      return res.status(409).json({ error: "user_already_claimed" });
    }

    // Get user metadata
    const userMetadata = user.user_metadata;
    const username =
      userMetadata?.user_name ||
      userMetadata?.preferred_username ||
      userMetadata?.screen_name ||
      "user";
    const avatar =
      userMetadata?.avatar_url ||
      userMetadata?.picture ||
      userMetadata?.profile_image_url ||
      null;

    // Claim the signature using service role client
    const insertData = {
      name: sanitizedName.toUpperCase(),
      signature_path: signaturePath,
      claimed_by_user_id: user.id,
      claimed_by_username: username,
      claimed_by_avatar: avatar,
      stroke_config: strokeConfig,
      include_numbers: includeNumbers,
    };

    const { data, error } = await serviceClient
      .from("claimed_signatures")
      .insert(insertData)
      .select()
      .limit(1)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: "Failed to claim signature" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error claiming signature:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
