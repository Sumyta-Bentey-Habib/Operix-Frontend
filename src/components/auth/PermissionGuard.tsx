"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/auth";

export interface PermissionGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export const PermissionGuard = ({ allowedRoles, children }: PermissionGuardProps) => {
  const { isLoading, viewer } = useAuth();

  if (isLoading) return null;

  if (!viewer || !allowedRoles.includes(viewer.role)) {
    return (
      <div
        role="alert"
        style={{
          minHeight: "360px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          textAlign: "center",
          color: "var(--text-primary)",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.35rem", marginBottom: "8px" }}>
            You do not have permission to access this page.
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            This management area is available to Super Admin users only.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
