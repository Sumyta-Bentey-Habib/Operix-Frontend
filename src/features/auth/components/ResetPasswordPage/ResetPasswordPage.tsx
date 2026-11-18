"use client";

import React, { useMemo, useState } from "react";
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
import { isOperixApiError } from "@/lib/api";
import { authApi } from "../../api/authApi";
import { validatePassword } from "../../utils/password-validator";
import shellStyles from "../SetupPasswordPage/SetupPasswordPage.module.css";
import styles from "../AuthRecovery/AuthRecovery.module.css";

export const ResetPasswordContent: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || searchParams.get("code") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validation = useMemo(
    () => validatePassword(password, confirmPassword),
    [password, confirmPassword],
  );

  const showInvalidLink = !token || isLinkInvalid;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setIsLinkInvalid(true);
      return;
    }

    if (!validation.isValid) {
      setErrorMessage(
        !validation.passwordsMatch
          ? AUTH_STRINGS.resetPassword.errors.passwordMismatch
          : AUTH_STRINGS.resetPassword.errors.policyUnmet,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({ token, password });
      setIsSuccess(true);
    } catch (error) {
      // An expired or already-consumed token is a recovery case, not a bug:
      // offer a fresh request instead of a dead end.
      if (isOperixApiError(error) && (error.status === 400 || error.code === "INVALID_TOKEN")) {
        setIsLinkInvalid(true);
        return;
      }
      setErrorMessage(
        error instanceof Error ? error.message : AUTH_STRINGS.resetPassword.errors.genericFailure,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRules = () => (
    <div className={shellStyles.rulesContainer}>
      <p className={shellStyles.rulesTitle}>{AUTH_STRINGS.resetPassword.rulesTitle}</p>

      <div
        className={`${shellStyles.ruleItem} ${validation.minLength ? shellStyles.ruleItemValid : ""}`}
      >
        <span className={shellStyles.ruleIcon}>{validation.minLength ? "✓" : "○"}</span>
        <span>{AUTH_STRINGS.resetPassword.rules.minLength}</span>
      </div>

      <div
        className={`${shellStyles.ruleItem} ${validation.hasUppercase ? shellStyles.ruleItemValid : ""}`}
      >
        <span className={shellStyles.ruleIcon}>{validation.hasUppercase ? "✓" : "○"}</span>
        <span>{AUTH_STRINGS.resetPassword.rules.hasUppercase}</span>
      </div>

      <div
        className={`${shellStyles.ruleItem} ${validation.hasLowercase ? shellStyles.ruleItemValid : ""}`}
      >
        <span className={shellStyles.ruleIcon}>{validation.hasLowercase ? "✓" : "○"}</span>
        <span>{AUTH_STRINGS.resetPassword.rules.hasLowercase}</span>
      </div>

      <div
        className={`${shellStyles.ruleItem} ${validation.hasNumber ? shellStyles.ruleItemValid : ""}`}
      >
        <span className={shellStyles.ruleIcon}>{validation.hasNumber ? "✓" : "○"}</span>
        <span>{AUTH_STRINGS.resetPassword.rules.hasNumber}</span>
      </div>

      <div
        className={`${shellStyles.ruleItem} ${validation.hasSpecial ? shellStyles.ruleItemValid : ""}`}
      >
        <span className={shellStyles.ruleIcon}>{validation.hasSpecial ? "✓" : "○"}</span>
        <span>{AUTH_STRINGS.resetPassword.rules.hasSpecial}</span>
      </div>

      <div
        className={`${shellStyles.ruleItem} ${validation.passwordsMatch && confirmPassword.length > 0 ? shellStyles.ruleItemValid : ""}`}
      >
        <span className={shellStyles.ruleIcon}>
          {validation.passwordsMatch && confirmPassword.length > 0 ? "✓" : "○"}
        </span>
        <span>{AUTH_STRINGS.resetPassword.rules.passwordsMatch}</span>
      </div>
    </div>
  );

  return (
    <div className={shellStyles.pageContainer}>
      <div className={shellStyles.ambientBackground} aria-hidden="true">
        <div className={shellStyles.orbTopLeft} />
        <div className={shellStyles.orbMiddleRight} />
        <div className={shellStyles.orbBottomLeft} />
        <div className={shellStyles.orbCenterGlow} />
      </div>

      <header className={shellStyles.topNavHeader}>
        <Link href="/" className={shellStyles.brandLogoGroup}>
          <div className={shellStyles.brandLogoIcon}>
            <LogoIcon size={22} />
          </div>
          <div className={shellStyles.brandNameContainer}>
            <span className={shellStyles.brandLogoText}>{AUTH_STRINGS.brand.name}</span>
            <span className={shellStyles.brandLogoSub}>{AUTH_STRINGS.brand.subName}</span>
          </div>
        </Link>

        <div className={shellStyles.topQuickPills}>
          <span className={shellStyles.topRoleIndicator}>🌿 {AUTH_STRINGS.brand.tagline}</span>
        </div>
      </header>

      <main className={shellStyles.mainSection}>
        <div className={shellStyles.authCardContainer}>
          {isSuccess ? (
            <div className={shellStyles.successContainer}>
              <div className={shellStyles.successIconWrapper}>
                <CheckCircleIcon size={36} />
              </div>
              <h2 className={shellStyles.successTitle}>
                {AUTH_STRINGS.resetPassword.successTitle}
              </h2>
              <p className={shellStyles.successMessage}>
                {AUTH_STRINGS.resetPassword.successMessage}
              </p>

              <div className={styles.actionsStack}>
                <Link href="/login" className={shellStyles.submitBtn}>
                  <span>{AUTH_STRINGS.resetPassword.backToSignIn}</span>
                  <ArrowRightIcon size={18} />
                </Link>
              </div>
            </div>
          ) : showInvalidLink ? (
            <div className={shellStyles.invalidCard}>
              <div className={shellStyles.warningIcon}>⚠️</div>
              <h2 className={shellStyles.authCardTitle}>
                {AUTH_STRINGS.resetPassword.invalidTokenTitle}
              </h2>
              <p className={shellStyles.authCardSubtitle}>
                {AUTH_STRINGS.resetPassword.invalidTokenMessage}
              </p>

              <div className={styles.actionsStack}>
                <Link href="/forgot-password" className={shellStyles.submitBtn}>
                  <span>{AUTH_STRINGS.resetPassword.requestNewLink}</span>
                  <ArrowRightIcon size={18} />
                </Link>
                <Link href="/login" className={styles.secondaryLink}>
                  {AUTH_STRINGS.resetPassword.backToSignIn}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className={shellStyles.authCardHeader}>
                <h2 className={shellStyles.authCardTitle}>{AUTH_STRINGS.resetPassword.title}</h2>
                <p className={shellStyles.authCardSubtitle}>
                  {AUTH_STRINGS.resetPassword.subtitle}
                </p>
              </div>

              {errorMessage && (
                <div className={shellStyles.errorBanner} role="alert">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className={shellStyles.formGroup}>
                  <label className={shellStyles.fieldLabel} htmlFor="reset-password">
                    {AUTH_STRINGS.resetPassword.newPasswordLabel}
                  </label>
                  <div className={shellStyles.inputWrapper}>
                    <span className={shellStyles.inputIconLeft}>
                      <LockIcon size={18} />
                    </span>
                    <input
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={AUTH_STRINGS.resetPassword.newPasswordPlaceholder}
                      className={`${shellStyles.textInput} ${shellStyles.textInputWithRightIcon}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={shellStyles.inputToggleRight}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                <div className={shellStyles.formGroup}>
                  <label className={shellStyles.fieldLabel} htmlFor="reset-confirm-password">
                    {AUTH_STRINGS.resetPassword.confirmPasswordLabel}
                  </label>
                  <div className={shellStyles.inputWrapper}>
                    <span className={shellStyles.inputIconLeft}>
                      <LockIcon size={18} />
                    </span>
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder={AUTH_STRINGS.resetPassword.confirmPasswordPlaceholder}
                      className={`${shellStyles.textInput} ${shellStyles.textInputWithRightIcon}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className={shellStyles.inputToggleRight}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                {renderRules()}

                <button
                  type="submit"
                  disabled={isSubmitting || !validation.isValid}
                  className={shellStyles.submitBtn}
                >
                  {isSubmitting ? (
                    <>
                      <div className={shellStyles.spinner} />
                      <span>{AUTH_STRINGS.resetPassword.submittingBtn}</span>
                    </>
                  ) : (
                    <>
                      <span>{AUTH_STRINGS.resetPassword.submitBtn}</span>
                      <ArrowRightIcon size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      <footer className={shellStyles.pageFooter}>
        <p>{AUTH_STRINGS.brand.copyright}</p>
      </footer>
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => (
  <React.Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#030403" }} />}>
    <ResetPasswordContent />
  </React.Suspense>
);
