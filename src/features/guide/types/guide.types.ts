import type { UserRole } from "@/types/auth";

export type GuideLanguage = "en" | "bn";

export interface LocalizedString {
  en: string;
  bn: string;
}

export interface GuidePageDetail {
  id?: string;
  route: string;
  name: LocalizedString;
  description: LocalizedString;
}

export interface GuideRestrictedPage {
  route: string;
  reason: LocalizedString;
}

export interface GuideModuleItem {
  step?: number;
  phase?: string;
  action?: LocalizedString;
  title?: LocalizedString;
  instruction?: LocalizedString;
  name?: LocalizedString;
  description?: LocalizedString;
  detail?: LocalizedString;
  content?: LocalizedString;
  explanation?: LocalizedString;
  steps?: LocalizedString;
  options?: Array<{
    decision: string;
    actionName: LocalizedString;
    explanation: LocalizedString;
  }>;
}

export interface GuideModule {
  title: LocalizedString;
  overview?: LocalizedString;
  rules?: LocalizedString;
  details?: LocalizedString;
  steps?: GuideModuleItem[];
  features?: GuideModuleItem[];
  metrics?: GuideModuleItem[];
  instructions?: GuideModuleItem[];
  operations?: Array<{
    operation: LocalizedString;
    steps: LocalizedString;
  }>;
  capabilities?: Array<{
    action?: LocalizedString;
    feature?: LocalizedString;
    description?: LocalizedString;
    explanation?: LocalizedString;
  }>;
}

export interface RoleUserGuide {
  role: UserRole;
  metadata: {
    version: string;
    lastUpdated: string;
    targetAudience: LocalizedString;
  };
  title: LocalizedString;
  description: LocalizedString;
  scope: LocalizedString;
  navigation: {
    accessiblePages: GuidePageDetail[];
    restrictedPages: GuideRestrictedPage[];
  };
  modules: Record<string, GuideModule>;
  rules: {
    en: string[];
    bn: string[];
  };
}
