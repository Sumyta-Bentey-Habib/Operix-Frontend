"use client";

import React, { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export const AuthGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

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
        <span style={{ fontSize: "0.88rem", color: "#9ca3af" }}>
          Redirecting to Login...
        </span>
      </div>
    );
  }

  return <>{children}</>;
};

