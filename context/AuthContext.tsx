"use client";

import React, {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AuthContextType, AuthUser, UserRole } from "@/types/auth";
import {
  DEMO_USERS_LIST,
  DEMO_USER_PRESETS,
  findDemoUserByCredentials,
  findDemoUserByRole,
} from "@/data/authData";

const AUTH_STORAGE_KEY = "operix_auth_session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const emptySubscribe = () => () => {};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.role && DEMO_USER_PRESETS[parsed.role as UserRole]) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const router = useRouter();
  const isLoading = !isMounted;

  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Artificial slight delay for realistic feedback
    await new Promise((resolve) => setTimeout(resolve, 350));

    const matchedUser = findDemoUserByCredentials(email, password);

    if (!matchedUser) {
      return {
        success: false,
        error:
          "Invalid email or password. Please verify your credentials.",
      };
    }

    const authUser: AuthUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      roleLabel: matchedUser.roleLabel,
      avatarUrl: matchedUser.avatarUrl,
      badge: matchedUser.badge,
      description: matchedUser.description,
      permissions: matchedUser.permissions,
    };

    setUser(authUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    } catch {
      // ignore storage error
    }

    return { success: true };
  };

  const loginWithRole = async (role: UserRole): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const preset = findDemoUserByRole(role);
    const authUser: AuthUser = {
      id: preset.id,
      name: preset.name,
      email: preset.email,
      role: preset.role,
      roleLabel: preset.roleLabel,
      avatarUrl: preset.avatarUrl,
      badge: preset.badge,
      description: preset.description,
      permissions: preset.permissions,
    };

    setUser(authUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    } catch {
      // ignore storage error
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore storage error
    }
    router.replace("/login");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithRole,
    logout,
    availableRoles: DEMO_USERS_LIST,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
