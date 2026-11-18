"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AUTH_STRINGS } from "@/constants/auth-strings";
import { LogoIcon, MailIcon, ArrowRightIcon, CheckCircleIcon } from "@/components/icons";
import { authApi } from "../../api/authApi";
import { isValidEmail } from "../../utils/password-validator";
import shellStyles from "../SetupPasswordPage/SetupPasswordPage.module.css";
import styles from "../AuthRecovery/AuthRecovery.module.css";

export const ForgotPasswordContent: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage(AUTH_STRINGS.forgotPassword.errors.invalidEmail);
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.requestPasswordReset(trimmedEmail, `${window.location.origin}/reset-password`);
      // Better Auth answers generically for known and unknown addresses alike.
      // The confirmation below must stay identical in both cases.
      setIsSubmitted(true);
    } catch {
      setErrorMessage(AUTH_STRINGS.forgotPassword.errors.genericFailure);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {isSubmitted ? (
            <div className={shellStyles.successContainer}>
              <div className={shellStyles.successIconWrapper}>
                <CheckCircleIcon size={36} />
              </div>
              <h2 className={shellStyles.successTitle}>
                {AUTH_STRINGS.forgotPassword.confirmationTitle}
              </h2>
              <p className={shellStyles.successMessage}>
                {AUTH_STRINGS.forgotPassword.confirmationMessage}
              </p>
              <p className={styles.helperText}>{AUTH_STRINGS.forgotPassword.confirmationHint}</p>

              <div className={styles.actionsStack}>
                <Link href="/login" className={shellStyles.submitBtn}>
                  <span>{AUTH_STRINGS.forgotPassword.backToSignIn}</span>
                  <ArrowRightIcon size={18} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className={shellStyles.authCardHeader}>
                <h2 className={shellStyles.authCardTitle}>{AUTH_STRINGS.forgotPassword.title}</h2>
                <p className={shellStyles.authCardSubtitle}>
                  {AUTH_STRINGS.forgotPassword.subtitle}
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
                  <label className={shellStyles.fieldLabel} htmlFor="forgot-email">
                    {AUTH_STRINGS.forgotPassword.emailLabel}
                  </label>
                  <div className={shellStyles.inputWrapper}>
                    <span className={shellStyles.inputIconLeft}>
                      <MailIcon size={18} />
                    </span>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={AUTH_STRINGS.forgotPassword.emailPlaceholder}
                      className={shellStyles.textInput}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className={shellStyles.submitBtn}>
                  {isSubmitting ? (
                    <>
                      <div className={shellStyles.spinner} />
                      <span>{AUTH_STRINGS.forgotPassword.submittingBtn}</span>
                    </>
                  ) : (
                    <>
                      <span>{AUTH_STRINGS.forgotPassword.submitBtn}</span>
                      <ArrowRightIcon size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className={styles.actionsStack}>
                <Link href="/login" className={styles.secondaryLink}>
                  {AUTH_STRINGS.forgotPassword.backToSignIn}
                </Link>
              </div>
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

export const ForgotPasswordPage: React.FC = () => <ForgotPasswordContent />;
