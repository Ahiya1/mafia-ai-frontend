// src/lib/auth-context.tsx - Real Backend Integration
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import toast from "react-hot-toast";

// Real backend data structures
interface UserProfile {
  id: string;
  username: string;
  email: string;
  total_games_played: number;
  total_wins: number;
  ai_detection_accuracy: number;
  preferred_ai_tier: "free" | "premium";
  is_creator: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

interface UserPackage {
  id: string;
  package_id: string;
  package_name: string;
  games_remaining: number;
  expires_at: string;
  is_active: boolean;
  features: string[];
  amount_paid: number;
  purchase_date: string;
}

interface GameAccess {
  hasAccess: boolean;
  accessType: "admin" | "premium_package" | "free" | "none";
  gamesRemaining: number;
  packageType: string;
  premiumFeatures: boolean;
  reason?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  userPackages: UserPackage[];
  gameAccess: GameAccess | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshPackages: () => Promise<void>;
  checkGameAccess: (requiresPremium?: boolean) => Promise<GameAccess | null>;
  consumeGame: (isPremiumGame?: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userPackages, setUserPackages] = useState<UserPackage[]>([]);
  const [gameAccess, setGameAccess] = useState<GameAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://mafia-ai-production.up.railway.app";

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      // For now, we'll get the user ID from the token (in a real app, decode JWT)
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        localStorage.removeItem("auth_token");
        setIsLoading(false);
        return;
      }

      // Fetch user profile (you may need to implement this endpoint)
      // For now, we'll simulate with stored user data
      const storedUser = localStorage.getItem("user_profile");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        await refreshPackages();
        await checkGameAccess();
      } else {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_id");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_profile");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store auth data
        localStorage.setItem("auth_token", data.session.access_token);
        localStorage.setItem("user_id", data.user.id);
        localStorage.setItem("user_profile", JSON.stringify(data.user));

        setUser(data.user);

        // Fetch packages and game access
        await refreshPackages();
        await checkGameAccess();

        toast.success(`Welcome back, ${data.user.username}! 🕵️‍♂️`);
        return true;
      } else {
        toast.error(data.error || "Failed to sign in");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Connection error. Please try again.");
      return false;
    }
  };

  const signup = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Account created! Please sign in to continue.", {
          icon: "✅",
          duration: 5000,
        });
        return true;
      } else {
        toast.error(data.error || "Failed to create account");
        return false;
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Connection error. Please try again.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_profile");
    setUser(null);
    setUserPackages([]);
    setGameAccess(null);
    toast.success("Signed out successfully");
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const refreshPackages = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const response = await fetch(`${API_URL}/api/user/packages`, {
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserPackages(data.packages || []);
        }
      }
    } catch (error) {
      console.error("Failed to refresh packages:", error);
    }
  };

  const checkGameAccess = async (
    requiresPremium: boolean = false
  ): Promise<GameAccess | null> => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return null;

      const response = await fetch(`${API_URL}/api/game/check-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, requiresPremium }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGameAccess(data);
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to check game access:", error);
      return null;
    }
  };

  const consumeGame = async (
    isPremiumGame: boolean = false
  ): Promise<boolean> => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return false;

      const response = await fetch(`${API_URL}/api/game/consume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          isPremiumGame,
          gameSessionId: `game_${Date.now()}`,
          roomCode: "TBD", // Will be set when room is created
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh game access after consuming
          await checkGameAccess(isPremiumGame);
          await refreshPackages();
          return true;
        } else {
          toast.error(data.error || "Cannot start game");
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error("Failed to consume game:", error);
      toast.error("Failed to start game");
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    userPackages,
    gameAccess,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
    refreshPackages,
    checkGameAccess,
    consumeGame,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
