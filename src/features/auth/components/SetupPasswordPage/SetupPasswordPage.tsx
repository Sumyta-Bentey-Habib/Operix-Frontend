"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AUTH_STRINGS } from "@/constants/auth-strings";
import {
  LogoIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@/components/icons";
import { registrationApi } from "../../api/registrationApi";
import { validatePassword } from "../../utils/password-validator";
import styles from "./SetupPasswordPage.module.css";

export const SetupPasswordContent: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || searchParams.get("code") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validation = useMemo(() => {
    return validatePassword(password, confirmPassword);
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage(AUTH_STRINGS.setupPassword.errors.tokenMissing);
      return;
    }

    if (!validation.isValid) {
      if (!validation.passwordsMatch) {
        setErrorMessage(AUTH_STRINGS.setupPassword.errors.passwordMismatch);
      } else {
        setErrorMessage(AUTH_STRINGS.setupPassword.errors.policyUnmet);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await registrationApi.setupPassword({
        token,
        password,
      });
      setIsSuccess(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : AUTH_STRINGS.setupPassword.errors.genericFailure;
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Background Ambient Lighting */}
      <div className={styles.ambientBackground} aria-hidden="true">
        <div className={styles.orbTopLeft} />
        <div className={styles.orbMiddleRight} />
        <div className={styles.orbBottomLeft} />
        <div className={styles.orbCenterGlow} />
      </div>

      {/* Top Navbar */}
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

      {/* Main Content */}
      <main className={styles.mainSection}>
        <div className={styles.authCardContainer}>
          {isSuccess ? (
            <div className={styles.successContainer}>
              <div className={styles.successIconWrapper}>
                <CheckCircleIcon size={36} />
              </div>
              <h2 className={styles.successTitle}>{AUTH_STRINGS.setupPassword.successTitle}</h2>
              <p className={styles.successMessage}>{AUTH_STRINGS.setupPassword.successMessage}</p>

              <Link href="/login" className={styles.submitBtn}>
                <span>{AUTH_STRINGS.setupPassword.proceedToSignIn}</span>
                <ArrowRightIcon size={18} />
              </Link>
            </div>
          ) : !token ? (
            <div className={styles.invalidCard}>
              <div className={styles.warningIcon}>⚠️</div>
              <h2 className={styles.authCardTitle}>
                {AUTH_STRINGS.setupPassword.invalidTokenTitle}
              </h2>
              <p className={styles.authCardSubtitle}>
                {AUTH_STRINGS.setupPassword.invalidTokenMessage}
              </p>
              <div style={{ marginTop: "24px" }}>
                <Link href="/login" className={styles.submitBtn}>
                  <span>{AUTH_STRINGS.signUp.backToHome}</span>
                  <ArrowRightIcon size={18} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.authCardHeader}>
                <h2 className={styles.authCardTitle}>{AUTH_STRINGS.setupPassword.title}</h2>
                <p className={styles.authCardSubtitle}>{AUTH_STRINGS.setupPassword.subtitle}</p>
              </div>

              {errorMessage && (
                <div className={styles.errorBanner} role="alert">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel} htmlFor="new-password">
                    {AUTH_STRINGS.setupPassword.newPasswordLabel}
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIconLeft}>
                      <LockIcon size={18} />
                    </span>
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={AUTH_STRINGS.setupPassword.newPasswordPlaceholder}
                      className={`${styles.textInput} ${styles.textInputWithRightIcon}`}
                      autoComplete="new-password"
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

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel} htmlFor="confirm-password">
                    {AUTH_STRINGS.setupPassword.confirmPasswordLabel}
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIconLeft}>
                      <LockIcon size={18} />
                    </span>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={AUTH_STRINGS.setupPassword.confirmPasswordPlaceholder}
                      className={`${styles.textInput} ${styles.textInputWithRightIcon}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={styles.inputToggleRight}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements Checklist */}
                <div className={styles.rulesContainer}>
                  <p className={styles.rulesTitle}>Security Requirements</p>

                  <div
                    className={`${styles.ruleItem} ${validation.minLength ? styles.ruleItemValid : ""}`}
                  >
                    <span className={styles.ruleIcon}>{validation.minLength ? "✓" : "○"}</span>
                    <span>{AUTH_STRINGS.setupPassword.rules.minLength}</span>
                  </div>

                  <div
                    className={`${styles.ruleItem} ${validation.hasUppercase ? styles.ruleItemValid : ""}`}
                  >
                    <span className={styles.ruleIcon}>{validation.hasUppercase ? "✓" : "○"}</span>
                    <span>{AUTH_STRINGS.setupPassword.rules.hasUppercase}</span>
                  </div>

                  <div
                    className={`${styles.ruleItem} ${validation.hasLowercase ? styles.ruleItemValid : ""}`}
                  >
                    <span className={styles.ruleIcon}>{validation.hasLowercase ? "✓" : "○"}</span>
                    <span>{AUTH_STRINGS.setupPassword.rules.hasLowercase}</span>
                  </div>

                  <div
                    className={`${styles.ruleItem} ${validation.hasNumber ? styles.ruleItemValid : ""}`}
                  >
                    <span className={styles.ruleIcon}>{validation.hasNumber ? "✓" : "○"}</span>
                    <span>{AUTH_STRINGS.setupPassword.rules.hasNumber}</span>
                  </div>

                  <div
                    className={`${styles.ruleItem} ${validation.hasSpecial ? styles.ruleItemValid : ""}`}
                  >
                    <span className={styles.ruleIcon}>{validation.hasSpecial ? "✓" : "○"}</span>
                    <span>{AUTH_STRINGS.setupPassword.rules.hasSpecial}</span>
                  </div>

                  <div
                    className={`${styles.ruleItem} ${validation.passwordsMatch && confirmPassword.length > 0 ? styles.ruleItemValid : ""}`}
                  >
                    <span className={styles.ruleIcon}>
                      {validation.passwordsMatch && confirmPassword.length > 0 ? "✓" : "○"}
                    </span>
                    <span>{AUTH_STRINGS.setupPassword.rules.passwordsMatch}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !validation.isValid}
                  className={styles.submitBtn}
                >
                  {isSubmitting ? (
                    <>
                      <div className={styles.spinner} />
                      <span>{AUTH_STRINGS.setupPassword.submittingBtn}</span>
                    </>
                  ) : (
                    <>
                      <span>{AUTH_STRINGS.setupPassword.submitBtn}</span>
                      <ArrowRightIcon size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.pageFooter}>
        <p>{AUTH_STRINGS.brand.copyright}</p>
      </footer>
    </div>
  );
};

export const SetupPasswordPage: React.FC = () => {
  return (
    <React.Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#030403" }} />}>
      <SetupPasswordContent />
    </React.Suspense>
  );
};
