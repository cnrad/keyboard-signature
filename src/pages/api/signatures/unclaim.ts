import { NextApiRequest, NextApiResponse } from "next";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/auth";

export interface UnclaimSignatureParams {
  name: string;
  username: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, username } = req.body as UnclaimSignatureParams;

    // Validate input
    if (!name || !username) {
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

    // Check if signature is claimed
    const { data: existingClaim, error: checkError } = await serviceClient
      .from("claimed_signatures")
      .select("*")
      .eq("name", sanitizedName.toUpperCase())
      .eq("claimed_by_user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (checkError) {
      return res.status(500).json({ error: "Failed to check existing claim" });
    }

    if (!existingClaim) {
      return res.status(404).json({ error: "signature_not_found" });
    }

    // Delete the claimed signature by record id
    const { data, error } = await serviceClient
      .from("claimed_signatures")
      .delete()
      .eq("id", existingClaim.id);

    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to unclaim signature" });
    }

    return res.status(200).json({ success: "true" });
  } catch (error) {
    console.error("Error unclaiming signature:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
