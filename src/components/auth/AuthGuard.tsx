"use client";

import React, { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/LoadingState";

export const AuthGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { viewer, isAuthenticated, isLoading, hydrationStatus, hydrationError, retryHydration } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrationStatus === "UNAUTHENTICATED") {
      router.replace("/login");
    }
  }, [hydrationStatus, router]);

  if (hydrationStatus === "ERROR" && !viewer) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--bg-canvas)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-primary)",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Unable to confirm your session.
        </span>
        <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)", maxWidth: "400px" }}>
          {hydrationError?.message ?? "Please retry when the API is available."}
        </span>
        <button
          type="button"
          onClick={() => void retryHydration()}
          style={{
            border: "1px solid var(--primary-emerald)",
            borderRadius: "12px",
            background: "var(--primary-emerald)",
            color: "var(--text-inverse)",
            padding: "10px 22px",
            minHeight: "44px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.875rem",
            boxShadow: "0 2px 8px var(--primary-emerald-glow)",
          }}
        >
          Retry Session
        </button>
      </div>
    );
  }

  if (isLoading || !isAuthenticated) {
    return <LoadingState message="Checking your session..." fullPage />;
  }

  return <>{children}</>;
};
