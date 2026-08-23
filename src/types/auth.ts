export type UserRole = "superadmin" | "admin" | "member";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatarUrl: string;
  badge: string;
  description: string;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: UserRole;
}

export interface DemoUserPreset extends AuthUser {
  password: string;
  titleBadge: string;
  accentColor: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  availableRoles: DemoUserPreset[];
}
