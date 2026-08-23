import { DemoUserPreset, UserRole } from "@/types/auth";

export const DEMO_USER_PRESETS: Record<UserRole, DemoUserPreset> = {
  superadmin: {
    id: "usr_superadmin_01",
    name: "Sujon",
    email: "superadmin@apexpharmabd.com",
    password: "superadmin123",
    role: "superadmin",
    roleLabel: "Super Admin",
    titleBadge: "Full Root Access",
    badge: "Super Admin",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    accentColor: "#10B981",
    description:
      "Full administrative oversight with access to system config, pharmaceutical ledgers, user governance, and real-time revenue analytics.",
    permissions: [
      "system.all",
      "finance.read_write",
      "reports.export",
      "users.manage",
      "settings.manage",
    ],
  },
  admin: {
    id: "usr_admin_02",
    name: "Alex Mercer",
    email: "admin@apexpharmabd.com",
    password: "admin123",
    role: "admin",
    roleLabel: "Admin",
    titleBadge: "Operations Lead",
    badge: "Admin",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    accentColor: "#3B82F6",
    description:
      "Operational control across reports, supply transactions, payee management, and healthcare collaboration workflows.",
    permissions: ["finance.read", "finance.create", "reports.export", "contacts.manage"],
  },
  member: {
    id: "usr_member_03",
    name: "Sarah Chen",
    email: "member@apexpharmabd.com",
    password: "member123",
    role: "member",
    roleLabel: "Member",
    titleBadge: "Finance Associate",
    badge: "Member",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    accentColor: "#8B5CF6",
    description:
      "Personalized workspace for monitoring transaction history, payee distribution, and standard financial reports.",
    permissions: ["finance.read", "workspace.view"],
  },
};

export const DEMO_USERS_LIST: DemoUserPreset[] = Object.values(DEMO_USER_PRESETS);

export const findDemoUserByCredentials = (
  email: string,
  password?: string,
): DemoUserPreset | null => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check exact email or prefix match (supports @apexpharmabd.com or @operix.io or simple username)
  let matchedUser: DemoUserPreset | undefined;

  if (
    normalizedEmail === "superadmin@apexpharmabd.com" ||
    normalizedEmail === "superadmin@operix.io" ||
    normalizedEmail === "superadmin" ||
    normalizedEmail.startsWith("superadmin@")
  ) {
    matchedUser = DEMO_USER_PRESETS.superadmin;
  } else if (
    normalizedEmail === "admin@apexpharmabd.com" ||
    normalizedEmail === "admin@operix.io" ||
    normalizedEmail === "admin" ||
    normalizedEmail.startsWith("admin@")
  ) {
    matchedUser = DEMO_USER_PRESETS.admin;
  } else if (
    normalizedEmail === "member@apexpharmabd.com" ||
    normalizedEmail === "member@operix.io" ||
    normalizedEmail === "member" ||
    normalizedEmail.startsWith("member@")
  ) {
    matchedUser = DEMO_USER_PRESETS.member;
  } else {
    // Default match from list
    matchedUser = DEMO_USERS_LIST.find((u) => u.email.toLowerCase() === normalizedEmail);
  }

  if (!matchedUser) {
    // If not matching specific email, fallback to Super Admin if password matches
    if (password === "superadmin123" || password === "admin123" || password === "member123") {
      matchedUser = DEMO_USER_PRESETS.superadmin;
    } else {
      return null;
    }
  }

  if (password && matchedUser.password !== password) {
    // Allow flexible test password if testing
    if (password !== "admin123" && password !== "superadmin123" && password !== "member123") {
      return null;
    }
  }

  return matchedUser;
};

export const findDemoUserByRole = (role: UserRole): DemoUserPreset => {
  return DEMO_USER_PRESETS[role] || DEMO_USER_PRESETS.superadmin;
};
