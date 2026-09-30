"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/auth";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  FileDocIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import type { GuideLanguage, GuideModuleItem, RoleUserGuide } from "../../types/guide.types";
import { getGuideForRole } from "../../utils/guide-data";
import styles from "./UserGuide.module.css";

const ALL_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "MEMBER"];

export const UserGuide = () => {
  const { viewer } = useAuth();
  const userRole = viewer?.role ?? "MEMBER";

  const [selectedRole, setSelectedRole] = useState<UserRole>(userRole);
  const [language, setLanguage] = useState<GuideLanguage>("en");
  const [searchQuery, setSearchQuery] = useState("");

  const guide: RoleUserGuide = useMemo(() => getGuideForRole(selectedRole), [selectedRole]);

  const canSwitchRole = userRole === "SUPER_ADMIN" || userRole === "ADMIN";
  const availableRoles = useMemo(() => {
    if (userRole === "SUPER_ADMIN") return ALL_ROLES;
    if (userRole === "ADMIN") return ["ADMIN", "MEMBER"] as UserRole[];
    return ["MEMBER"] as UserRole[];
  }, [userRole]);

  // Text search filter
  const query = searchQuery.trim().toLowerCase();

  const filteredPages = useMemo(() => {
    if (!query) return guide.navigation.accessiblePages;
    return guide.navigation.accessiblePages.filter(
      (p) =>
        p.name[language].toLowerCase().includes(query) ||
        p.description[language].toLowerCase().includes(query) ||
        p.route.toLowerCase().includes(query),
    );
  }, [guide.navigation.accessiblePages, language, query]);

  const moduleEntries = useMemo(() => {
    const entries = Object.entries(guide.modules);
    if (!query) return entries;
    return entries.filter(([, mod]) => {
      const titleMatch = mod.title[language].toLowerCase().includes(query);
      const overviewMatch = mod.overview?.[language]?.toLowerCase().includes(query);
      const itemsMatch = (
        (mod.steps ??
          mod.features ??
          mod.metrics ??
          mod.instructions) as GuideModuleItem[] | undefined
      )?.some(
        (item) =>
          item.title?.[language]?.toLowerCase().includes(query) ||
          item.name?.[language]?.toLowerCase().includes(query) ||
          item.instruction?.[language]?.toLowerCase().includes(query) ||
          item.description?.[language]?.toLowerCase().includes(query) ||
          item.content?.[language]?.toLowerCase().includes(query) ||
          item.detail?.[language]?.toLowerCase().includes(query),
      );
      return titleMatch || overviewMatch || itemsMatch;
    });
  }, [guide.modules, language, query]);

  const filteredRules = useMemo(() => {
    const rulesList = guide.rules[language];
    if (!query) return rulesList;
    return rulesList.filter((r) => r.toLowerCase().includes(query));
  }, [guide.rules, language, query]);

  return (
    <div className={styles.container}>
      {/* Top Bar with Navigation & Controls */}
      <div className={styles.topBar}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/dashboard" className={styles.breadcrumbLink}>
            {language === "en" ? "Dashboard" : "ড্যাশবোর্ড"}
          </Link>
          <ChevronRightIcon size={12} className={styles.breadcrumbSeparator} />
          <span className={styles.breadcrumbCurrent}>
            {language === "en" ? "User Guide" : "ব্যবহারকারী সহায়িকা"}
          </span>
        </nav>

        <div className={styles.controlsGroup}>
          {canSwitchRole && (
            <div
              className={styles.roleSelector}
              role="radiogroup"
              aria-label="Select User Role Guide"
            >
              {availableRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  role="radio"
                  aria-checked={selectedRole === role}
                  className={`${styles.roleOption} ${
                    selectedRole === role ? styles.roleOptionActive : ""
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          )}

          <div
            className={styles.langToggle}
            role="radiogroup"
            aria-label="Language selection"
          >
            <button
              type="button"
              role="radio"
              aria-checked={language === "en"}
              className={`${styles.langButton} ${
                language === "en" ? styles.langButtonActive : ""
              }`}
              onClick={() => setLanguage("en")}
            >
              English
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={language === "bn"}
              className={`${styles.langButton} ${
                language === "bn" ? styles.langButtonActive : ""
              }`}
              onClick={() => setLanguage("bn")}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      {/* Header Card */}
      <header className={styles.headerCard}>
        <div className={styles.headerBadgeRow}>
          <span className={styles.roleBadge}>{guide.role}</span>
          <span className={styles.audienceBadge}>
            {guide.metadata.targetAudience[language]}
          </span>
          <span className={styles.versionBadge}>
            v{guide.metadata.version} ({guide.metadata.lastUpdated})
          </span>
        </div>

        <h1 className={styles.title}>{guide.title[language]}</h1>
        <p className={styles.description}>{guide.description[language]}</p>

        <div className={styles.scopeBox}>
          <ShieldCheckIcon size={18} className={styles.scopeIcon} />
          <div>
            <strong>
              {language === "en"
                ? "Operational Scope: "
                : "কার্যক্রমের পরিধি: "}
            </strong>
            <span>{guide.scope[language]}</span>
          </div>
        </div>
      </header>

      {/* Instant Search Bar */}
      <div className={styles.searchBarWrapper}>
        <SearchIcon size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder={
            language === "en"
              ? "Search instructions, workflows, rules..."
              : "নির্দেশনা, কাজের ধাপ বা নিয়মাবলী খুঁজুন..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.sectionGrid}>
        {/* Navigation & Access Matrix */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FileDocIcon size={18} />
              <span>
                {language === "en"
                  ? "Navigation & Accessible Pages"
                  : "ন্যাভিগেশন ও ব্যবহারযোগ্য পেইজসমূহ"}
              </span>
            </h2>
          </div>

          <div className={styles.pagesGrid}>
            {filteredPages.map((page) => (
              <div key={page.route} className={styles.pageItem}>
                <div className={styles.pageItemHeader}>
                  <span className={styles.pageItemName}>
                    {page.name[language]}
                  </span>
                  <span className={styles.pageItemRoute}>{page.route}</span>
                </div>
                <p className={styles.pageItemDescription}>
                  {page.description[language]}
                </p>
              </div>
            ))}
          </div>

          {guide.navigation.restrictedPages.length > 0 && (
            <div className={styles.restrictedPagesList}>
              <strong style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {language === "en"
                  ? "Restricted Sections for this Role:"
                  : "এই রোলের জন্য সীমাবদ্ধ সেকশনসমূহ:"}
              </strong>
              {guide.navigation.restrictedPages.map((restricted) => (
                <div key={restricted.route} className={styles.restrictedItem}>
                  <span className={styles.restrictedRoute}>
                    {restricted.route}
                  </span>
                  <span className={styles.restrictedReason}>
                    {restricted.reason[language]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Feature & Workflow Modules */}
        {moduleEntries.map(([key, mod]) => {
          const rawItems = (mod.steps ??
            mod.features ??
            mod.metrics ??
            mod.instructions ??
            mod.operations ??
            mod.capabilities) as GuideModuleItem[] | undefined;

          return (
            <section key={key} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{mod.title[language]}</h2>
              </div>

              {mod.overview && (
                <p className={styles.moduleSubtitle}>
                  {mod.overview[language]}
                </p>
              )}
              {mod.rules && (
                <p className={styles.moduleSubtitle}>{mod.rules[language]}</p>
              )}
              {mod.details && (
                <p className={styles.moduleSubtitle}>{mod.details[language]}</p>
              )}

              {rawItems && rawItems.length > 0 && (
                <div className={styles.moduleItemsList}>
                  {rawItems.map((item, idx) => {
                    const itemTitle =
                      item.title?.[language] ||
                      item.name?.[language] ||
                      item.action?.[language] ||
                      (item as { operation?: { [key: string]: string } }).operation?.[language] ||
                      (item as { feature?: { [key: string]: string } }).feature?.[language];

                    const itemContent =
                      item.instruction?.[language] ||
                      item.description?.[language] ||
                      item.content?.[language] ||
                      item.detail?.[language] ||
                      item.explanation?.[language] ||
                      (item as { steps?: { [key: string]: string } }).steps?.[language];

                    return (
                      <div
                        key={idx}
                        className={styles.moduleItemCard}
                      >
                        <div className={styles.itemHeaderRow}>
                          <span className={styles.itemNumberNode}>
                            {item.step ?? idx + 1}
                          </span>
                          {itemTitle && (
                            <h3 className={styles.itemTitle}>{itemTitle}</h3>
                          )}
                        </div>
                        {itemContent && (
                          <p className={styles.itemText}>{itemContent}</p>
                        )}

                        {/* If module step has options (like Approve vs Request Revision) */}
                        {item.options && (
                          <div className={styles.optionsGrid}>
                            {item.options.map((opt) => (
                              <div
                                key={opt.decision}
                                className={`${styles.optionCard} ${
                                  opt.decision === "APPROVE"
                                    ? styles.optionApprove
                                    : styles.optionRevision
                                }`}
                              >
                                <span className={styles.optionTitle}>
                                  {opt.actionName[language]}
                                </span>
                                <p className={styles.optionExplanation}>
                                  {opt.explanation[language]}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}

        {/* Operating Rules & Policies Card */}
        {filteredRules.length > 0 && (
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <CheckCircleIcon size={18} />
                <span>
                  {language === "en"
                    ? "Operating Rules & Enforcement"
                    : "অপারেটিং নিয়মাবলী ও নীতিমালা"}
                </span>
              </h2>
            </div>
            <ul className={styles.rulesList}>
              {filteredRules.map((rule, idx) => (
                <li key={idx} className={styles.ruleItem}>
                  <CheckCircleIcon size={16} className={styles.ruleCheck} />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
