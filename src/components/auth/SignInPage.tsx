"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./LoginPage.module.css";
import { useAuth } from "@/context/AuthContext";
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
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  // Form State
  const [email, setEmail] = useState("superadmin@apexpharmabd.com");
  const [password, setPassword] = useState("superadmin123");
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
      const res = await login(email, password);
      if (res.success) {
        router.replace("/dashboard");
      } else {
        setErrorMessage(res.error || "Authentication failed. Please verify your credentials.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    setErrorMessage(null);
    setInfoMessage("For password recovery, please contact Apex Pharma IT Administrator.");
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
        <Link href="/login" className={styles.brandLogoGroup}>
          <div className={styles.brandLogoIcon}>
            <LogoIcon size={22} />
          </div>
          <div className={styles.brandNameContainer}>
            <span className={styles.brandLogoText}>Operix</span>
            <span className={styles.brandLogoSub}>Apex Pharma</span>
          </div>
        </Link>

        <div className={styles.topQuickPills}>
          <span className={styles.topRoleIndicator}>🌿 Pharmaceutical Operations & Governance</span>
        </div>
      </header>

      {/* Dedicated Centered Sign In Card Area */}
      <main className={styles.signInSection}>
        <Link href="/login" className={styles.backButtonLink}>
          ← Back to Portal Overview
        </Link>

        <div className={styles.authCardContainer}>
          <div className={styles.authCardHeader}>
            <h2 className={styles.authCardTitle}>Sign In to Portal</h2>
            <p className={styles.authCardSubtitle}>
              Enter your enterprise credentials to access your personalized pharmaceutical
              workspace.
            </p>
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
                Work Email
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
                  placeholder="name@apexpharmabd.com"
                  className={styles.textInput}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.fieldLabel} htmlFor="password-input">
                Password
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
                  placeholder="Enter your password"
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
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className={styles.forgotPasswordLink}
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? (
                <>
                  <div className={styles.spinner} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRightIcon size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Page Footer */}
      <footer className={styles.pageFooter}>
        <p>
          © 2026 Operix • In collaboration with{" "}
          <a
            href="https://www.apexpharmabd.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            Apex Pharma Ltd.
          </a>{" "}
          Delivering healthcare excellence.
        </p>
      </footer>
    </div>
  );
};
