import type { OperixApiError } from "@/lib/api";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MEMBER";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type OperixViewerScope =
  | { type: "GLOBAL" }
  | { type: "ADMIN"; teamIds: string[] }
  | { type: "MEMBER"; teamId: string | null };

export interface OperixViewer {
  userId: string;
  role: UserRole;
  status: UserStatus;
  scope: OperixViewerScope;
}

export interface AuthProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export type AuthHydrationStatus =
  "IDLE" | "LOADING" | "AUTHENTICATED" | "UNAUTHENTICATED" | "ERROR";

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthContextType {
  viewer: OperixViewer | null;
  profile: AuthProfile | null;
  role: UserRole | null;
  status: UserStatus | null;
  scope: OperixViewerScope | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrationStatus: AuthHydrationStatus;
  hydrationError: OperixApiError | null;
  signIn: (email: string, password: string, options?: { rememberMe?: boolean }) => Promise<void>;
  signOut: () => Promise<void>;
  retryHydration: () => Promise<void>;
}
