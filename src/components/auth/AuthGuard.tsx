"use client";

import React, { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export const AuthGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { viewer, isAuthenticated, isLoading, hydrationStatus, hydrationError, retryHydration } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrationStatus === "UNAUTHENTICATED") {
      router.replace("/");
    }
  }, [hydrationStatus, router]);

  if (hydrationStatus === "ERROR" && !viewer) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#030403",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          gap: "16px",
        }}
      >
        <span style={{ fontSize: "0.95rem", color: "#ffffff" }}>
          Unable to confirm your session.
        </span>
        <span style={{ fontSize: "0.88rem", color: "#9ca3af" }}>
          {hydrationError?.message ?? "Please retry when the API is available."}
        </span>
        <button
          type="button"
          onClick={() => void retryHydration()}
          style={{
            border: "1px solid rgba(16, 185, 129, 0.6)",
            borderRadius: "999px",
            background: "rgba(16, 185, 129, 0.12)",
            color: "#ffffff",
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#030403",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          gap: "16px",
        }}
      >
        <style>{`
          @keyframes authSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid rgba(255, 255, 255, 0.15)",
            borderTopColor: "#10b981",
            borderRadius: "50%",
            animation: "authSpin 0.75s linear infinite",
          }}
        />
        <span style={{ fontSize: "0.88rem", color: "#9ca3af" }}>Checking your session...</span>
      </div>
    );
  }

  return <>{children}</>;
};
