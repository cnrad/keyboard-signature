import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  username: string;
  profilePic: string;
  email?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(formatUser(session.user));
      }
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(formatUser(session.user));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const formatUser = (supabaseUser: User): AuthUser => {
    const userMetadata = supabaseUser.user_metadata;
    return {
      id: supabaseUser.id,
      username:
        userMetadata.user_name ||
        userMetadata.preferred_username ||
        userMetadata.screen_name ||
        "user",
      profilePic:
        userMetadata.avatar_url ||
        userMetadata.picture ||
        userMetadata.profile_image_url ||
        "",
      email: supabaseUser.email || undefined,
    };
  };

  const signInWithTwitter = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: "https://signature.cnrad.dev",
      },
    });
    if (error) {
      console.error("Error signing in:", error.message);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return {
    user,
    isLoading,
    signInWithTwitter,
    signOut,
  };
};
