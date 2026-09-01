"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./LoginPage.module.css";
import { useAuth } from "@/context/AuthContext";
import { isOperixApiError } from "@/lib/api";
import { AUTH_STRINGS } from "@/constants/auth-strings";
import {
  LogoIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from "@/components/icons";

export const SignInPage: React.FC = () => {
  const { signIn, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password, { rememberMe });
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(
        isOperixApiError(error)
          ? error.message
          : "Authentication failed. Please verify your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    setErrorMessage(null);
    setInfoMessage(AUTH_STRINGS.signIn.forgotPasswordNotice);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Background ambient lighting */}
      <div className={styles.ambientBackground} aria-hidden="true">
        <div className={styles.orbTopLeft} />
        <div className={styles.orbMiddleRight} />
        <div className={styles.orbBottomLeft} />
        <div className={styles.orbCenterGlow} />
      </div>

      {/* Top Navbar Brand */}
      <header className={styles.topNavHeader}>
        <Link href="/" className={styles.brandLogoGroup}>
          <div className={styles.brandLogoIcon}>
            <LogoIcon size={22} />
          </div>
          <div className={styles.brandNameContainer}>
            <span className={styles.brandLogoText}>{AUTH_STRINGS.brand.name}</span>
            <span className={styles.brandLogoSub}>{AUTH_STRINGS.brand.subName}</span>
          </div>
        </Link>

        <div className={styles.topQuickPills}>
          <span className={styles.topRoleIndicator}>🌿 {AUTH_STRINGS.brand.tagline}</span>
        </div>
      </header>

      {/* Dedicated Centered Sign In Card Area */}
      <main className={styles.signInSection}>
        <Link href="/" className={styles.backButtonLink}>
          {AUTH_STRINGS.signIn.backToOverview}
        </Link>

        <div className={styles.authCardContainer}>
          <div className={styles.authCardHeader}>
            <h2 className={styles.authCardTitle}>{AUTH_STRINGS.signIn.title}</h2>
            <p className={styles.authCardSubtitle}>{AUTH_STRINGS.signIn.subtitle}</p>
          </div>

          {/* In-Screen Info Notice (e.g. Forgot Password) */}
          {infoMessage && (
            <div className={styles.infoBanner} role="status">
              <div className={styles.infoBannerLeft}>
                <span className={styles.infoBannerIcon}>
                  <ShieldCheckIcon size={18} />
                </span>
                <span className={styles.infoBannerText}>{infoMessage}</span>
              </div>
              <button
                type="button"
                className={styles.infoBannerCloseBtn}
                onClick={() => setInfoMessage(null)}
                aria-label="Dismiss notice"
                title="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* In-Screen Error Notice */}
          {errorMessage && (
            <div className={styles.errorBanner} role="alert">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.fieldLabel} htmlFor="email-input">
                {AUTH_STRINGS.signIn.emailLabel}
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIconLeft}>
                  <MailIcon size={18} />
                </span>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={AUTH_STRINGS.signIn.emailPlaceholder}
                  className={styles.textInput}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.fieldLabel} htmlFor="password-input">
                {AUTH_STRINGS.signIn.passwordLabel}
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIconLeft}>
                  <LockIcon size={18} />
                </span>
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={AUTH_STRINGS.signIn.passwordPlaceholder}
                  className={`${styles.textInput} ${styles.textInputWithRightIcon}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.inputToggleRight}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.formHelperRow}>
              <label className={styles.rememberMeLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkboxInput}
                />
                <span>{AUTH_STRINGS.signIn.rememberMe}</span>
              </label>

              <button
                type="button"
                className={styles.forgotPasswordLink}
                onClick={handleForgotPassword}
              >
                {AUTH_STRINGS.signIn.forgotPassword}
              </button>
            </div>

            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? (
                <>
                  <div className={styles.spinner} />
                  <span>{AUTH_STRINGS.signIn.submittingBtn}</span>
                </>
              ) : (
                <>
                  <span>{AUTH_STRINGS.signIn.submitBtn}</span>
                  <ArrowRightIcon size={18} />
                </>
              )}
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginTop: "20px",
                fontSize: "0.85rem",
                color: "#9ca3af",
              }}
            >
              <span>{AUTH_STRINGS.signIn.noAccountPrompt}</span>
              <Link
                href="/signup"
                style={{ color: "#ef4444", fontWeight: 600, textDecoration: "none" }}
              >
                {AUTH_STRINGS.signIn.requestAccessLink}
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Page Footer */}
      <footer className={styles.pageFooter}>
        <p>{AUTH_STRINGS.brand.copyright}</p>
      </footer>
    </div>
  );
};
