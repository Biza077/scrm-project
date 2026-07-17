"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  username: string;
  name: string;
  division: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name: string, newPassword?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USER: User = {
  username: "admin",
  name: "Maulida Fatimatul Mukaromah",
  division: "Divisi Produksi",
  role: "Administrator",
};

const PUBLIC_PATHS = ["/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("scrm_user");
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem("scrm_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auth guard: redirect to /login if not authenticated
  useEffect(() => {
    if (isLoading) return;
    const isPublic = PUBLIC_PATHS.includes(pathname);
    if (!user && !isPublic) {
      router.push("/login");
    } else if (user && isPublic) {
      router.push("/");
    }
  }, [user, isLoading, pathname, router]);

  const login = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          return { success: false, error: data.error || "Gagal login" };
        }
        
        const { token, user: userData } = data;
        localStorage.setItem("scrm_token", token);
        localStorage.setItem("scrm_user", JSON.stringify(userData));
        setUser(userData);
        router.push("/");
        return { success: true };
      } catch (err) {
        return { success: false, error: "Terjadi kesalahan server." };
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("scrm_user");
    localStorage.removeItem("scrm_token");
    setUser(null);
    router.push("/login");
  }, [router]);

  const updateProfile = useCallback(
    (name: string, newPassword?: string) => {
      if (!user) return;
      const updated: User = { ...user, name };
      localStorage.setItem("scrm_user", JSON.stringify(updated));
      setUser(updated);
      // NOTE: Password update would need a new API endpoint. 
      // We are ignoring password update logic here for now to keep it simple.
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
