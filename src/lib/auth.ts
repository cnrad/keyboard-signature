import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { parse, serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

// Client for server-side operations with service role (full access)
export function createServiceSupabaseClient() {
	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key - NEVER expose to client
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	);
}

// Client for API routes with user context (limited access)
export async function createServerSupabaseClient(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (!req || !res) {
		throw new Error(
			"Request and response objects are required for server-side auth",
		);
	}

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return parse(req.headers.cookie || "")[name];
				},
				set(name: string, value: string, options: Record<string, unknown>) {
					res.setHeader("Set-Cookie", serialize(name, value, options));
				},
				remove(name: string, options: Record<string, unknown>) {
					res.setHeader("Set-Cookie", serialize(name, "", options));
				},
			},
		},
	);
}

export async function getServerUser(req: NextApiRequest, res: NextApiResponse) {
	const supabase = await createServerSupabaseClient(req, res);

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return null;
	}

	return {
		id: user.id,
		username:
			user.user_metadata?.user_name ||
			user.user_metadata?.preferred_username ||
			user.user_metadata?.screen_name ||
			"user",
		profilePic:
			user.user_metadata?.avatar_url ||
			user.user_metadata?.picture ||
			user.user_metadata?.profile_image_url ||
			"",
		email: user.email,
	};
}

export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
	const user = await getServerUser(req, res);

	if (!user) {
		res.status(401).json({ error: "Unauthorized" });
		return null;
	}

	return user;
}
