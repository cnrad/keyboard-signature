import { NextApiRequest, NextApiResponse } from "next";
import {
	createServerSupabaseClient,
	createServiceSupabaseClient,
} from "@/lib/auth";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
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

		const { data, error } = await serviceClient
			.from("claimed_signatures")
			.select("*")
			.eq("claimed_by_user_id", user.id)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching user signatures:", error);
			return res.status(500).json({ error: "Failed to fetch user signatures" });
		}

		return res.status(200).json(data || []);
	} catch (error) {
		console.error("Error fetching user signatures:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
}
