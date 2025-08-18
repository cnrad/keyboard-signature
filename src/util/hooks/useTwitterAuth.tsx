// hooks/useTwitterAuth.js - Custom hook for auth state
import { useState, useEffect, createContext, useContext } from "react";

interface TwitterData {
  isAuthenticated: boolean;
  loading: boolean;
  user: {
    id: string;
    name: string;
    description: string;
    profile_image_url: string;
    username: string;
    verified: boolean;
  };
}

const TwitterAuthContext = createContext<TwitterData | null>(null);

export const TwitterAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/twitter/profile");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = "/api/auth/twitter/login";
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/twitter/logout", { method: "POST" });
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <TwitterAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        refreshAuth: checkAuth,
      }}
    >
      {children}
    </TwitterAuthContext.Provider>
  );
};

export const useTwitterAuth = () => {
  const context = useContext(TwitterAuthContext);
  if (!context) {
    throw new Error("useTwitterAuth must be used within TwitterAuthProvider");
  }
  return context;
};
