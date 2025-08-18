import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		"Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
	);
}

// This client is for client-side operations only
// Server-side operations should use the service role client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type Database = {
	public: {
		Tables: {
			claimed_signatures: {
				Row: {
					id: string;
					name: string;
					signature_path: string;
					claimed_by_user_id: string;
					claimed_by_username: string;
					claimed_by_avatar: string | null;
					created_at: string;
					stroke_config: {
						style: string;
						color: string;
						gradientStart: string;
						gradientEnd: string;
						width: number;
					};
					include_numbers: boolean;
				};
				Insert: {
					id?: string;
					name: string;
					signature_path: string;
					claimed_by_user_id: string;
					claimed_by_username: string;
					claimed_by_avatar?: string | null;
					created_at?: string;
					stroke_config: {
						style: string;
						color: string;
						gradientStart: string;
						gradientEnd: string;
						width: number;
					};
					include_numbers: boolean;
				};
				Update: {
					id?: string;
					name?: string;
					signature_path?: string;
					claimed_by_user_id?: string;
					claimed_by_username?: string;
					claimed_by_avatar?: string | null;
					created_at?: string;
					stroke_config?: {
						style: string;
						color: string;
						gradientStart: string;
						gradientEnd: string;
						width: number;
					};
					include_numbers?: boolean;
				};
			};
		};
	};
};
