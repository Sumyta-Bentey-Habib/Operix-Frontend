"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDynamicTabTitle } from "@/utils/document-title";

export interface UseDynamicDocumentTitleOptions {
  activeTab?: string;
  title?: string;
}

export function useDynamicDocumentTitle(options?: UseDynamicDocumentTitleOptions): void {
  const { viewer } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const documentTitle = getDynamicTabTitle({
      activeTab: options?.activeTab,
      pageTitle: options?.title,
      role: viewer?.role ?? null,
      pathname,
    });

    if (typeof document !== "undefined") {
      document.title = documentTitle;
    }
  }, [options?.activeTab, options?.title, viewer?.role, pathname]);
}
