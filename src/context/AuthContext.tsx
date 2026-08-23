"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authApi } from "@/features/auth/api/authApi";
import { viewerApi } from "@/features/auth/api/viewerApi";
import { isAuthRequiredError, isOperixApiError, OperixApiError } from "@/lib/api";
import type { AuthContextType, AuthHydrationStatus, AuthProfile, OperixViewer } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toOperixApiError = (error: unknown): OperixApiError => {
  if (isOperixApiError(error)) {
    return error;
  }

  return new OperixApiError("Authentication failed.", {
    status: 0,
    code: "AUTH_ERROR",
    details: null,
    cause: error,
  });
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [viewer, setViewer] = useState<OperixViewer | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [hydrationStatus, setHydrationStatus] = useState<AuthHydrationStatus>("IDLE");
  const [hydrationError, setHydrationError] = useState<OperixApiError | null>(null);
  const viewerRef = useRef<OperixViewer | null>(null);
  const hasBootedRef = useRef(false);

  const setViewerState = useCallback((nextViewer: OperixViewer | null) => {
    viewerRef.current = nextViewer;
    setViewer(nextViewer);
  }, []);

  const hydrateProfile = useCallback(async () => {
    try {
      const nextProfile = await authApi.getSession();
      setProfile(nextProfile);
    } catch {
      if (!viewerRef.current) {
        setProfile(null);
      }
    }
  }, []);

  const hydrateViewer = useCallback(
    async (options?: { throwOnFailure?: boolean }) => {
      if (!viewerRef.current) {
        setHydrationStatus("LOADING");
      }

      try {
        const nextViewer = await viewerApi.getMe();
        setViewerState(nextViewer);
        setHydrationStatus("AUTHENTICATED");
        setHydrationError(null);
        await hydrateProfile();
      } catch (error) {
        if (isAuthRequiredError(error)) {
          setViewerState(null);
          setProfile(null);
          setHydrationStatus("UNAUTHENTICATED");
          setHydrationError(null);
        } else {
          const apiError = toOperixApiError(error);
          setHydrationError(apiError);
          setHydrationStatus(viewerRef.current ? "AUTHENTICATED" : "ERROR");
        }

        if (options?.throwOnFailure) {
          throw error;
        }
      }
    },
    [hydrateProfile, setViewerState],
  );

  useEffect(() => {
    if (hasBootedRef.current) return;
    hasBootedRef.current = true;
    void hydrateViewer();
  }, [hydrateViewer]);

  const signIn = useCallback(
    async (email: string, password: string, options?: { rememberMe?: boolean }) => {
      setHydrationStatus("LOADING");
      setHydrationError(null);

      try {
        await authApi.signIn({
          email,
          password,
          rememberMe: options?.rememberMe,
        });
      } catch (error) {
        const apiError = toOperixApiError(error);
        setHydrationError(apiError);
        setHydrationStatus(viewerRef.current ? "AUTHENTICATED" : "UNAUTHENTICATED");
        throw error;
      }

      try {
        await hydrateViewer({ throwOnFailure: true });
      } catch (error) {
        setViewerState(null);
        setProfile(null);

        if (isOperixApiError(error) && (error.status === 401 || error.status === 403)) {
          try {
            await authApi.signOut();
          } catch {
            // Best effort cleanup only.
          }
        }

        throw error;
      }
    },
    [hydrateViewer, setViewerState],
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.signOut();
      setViewerState(null);
      setProfile(null);
      setHydrationStatus("UNAUTHENTICATED");
      setHydrationError(null);
    } catch (error) {
      if (isAuthRequiredError(error)) {
        setViewerState(null);
        setProfile(null);
        setHydrationStatus("UNAUTHENTICATED");
        setHydrationError(null);
        return;
      }

      const apiError = toOperixApiError(error);
      setHydrationError(apiError);
      setHydrationStatus(viewerRef.current ? "AUTHENTICATED" : "ERROR");
      throw error;
    }
  }, [setViewerState]);

  const isAuthenticated = hydrationStatus === "AUTHENTICATED" && viewer !== null;

  const value: AuthContextType = useMemo(
    () => ({
      viewer,
      profile,
      role: viewer?.role ?? null,
      status: viewer?.status ?? null,
      scope: viewer?.scope ?? null,
      isAuthenticated,
      isLoading: hydrationStatus === "IDLE" || hydrationStatus === "LOADING",
      hydrationStatus,
      hydrationError,
      signIn,
      signOut,
      retryHydration: hydrateViewer,
    }),
    [
      viewer,
      profile,
      isAuthenticated,
      hydrationStatus,
      hydrationError,
      signIn,
      signOut,
      hydrateViewer,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
