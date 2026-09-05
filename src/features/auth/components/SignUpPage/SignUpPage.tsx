"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AUTH_STRINGS } from "@/constants/auth-strings";
import {
  LogoIcon,
  MailIcon,
  ContactsIcon,
  FileDocIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { registrationApi } from "../../api/registrationApi";
import { isValidEmail } from "../../utils/password-validator";
import styles from "./SignUpPage.module.css";

interface SubmittedDetails {
  name: string;
  email: string;
  designation?: string;
  employeeId?: string;
}

export const SignUpPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedDetails, setSubmittedDetails] = useState<SubmittedDetails | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage(AUTH_STRINGS.signUp.errors.nameRequired);
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage(AUTH_STRINGS.signUp.errors.emailRequired);
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage(AUTH_STRINGS.signUp.errors.emailInvalid);
      return;
    }

    setIsSubmitting(true);

    try {
      await registrationApi.submitSignupRequest({
        name: trimmedName,
        email: trimmedEmail,
        designation: designation.trim() || null,
        employeeId: employeeId.trim() || null,
      });

      setSubmittedDetails({
        name: trimmedName,
        email: trimmedEmail,
        designation: designation.trim() || undefined,
        employeeId: employeeId.trim() || undefined,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : AUTH_STRINGS.signUp.errors.genericFailure;
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

      {/* Main Content Card */}
      <main className={styles.mainSection}>
        <Link href="/login" className={styles.backButtonLink}>
          {AUTH_STRINGS.signIn.backToOverview}
        </Link>

        <div className={styles.authCardContainer}>
          {submittedDetails ? (
            <div className={styles.successContainer}>
              <div className={styles.successIconWrapper}>
                <CheckCircleIcon size={36} />
              </div>
              <h2 className={styles.successTitle}>{AUTH_STRINGS.signUp.successTitle}</h2>
              <p className={styles.successMessage}>{AUTH_STRINGS.signUp.successMessage}</p>

              <div className={styles.successDetailsCard}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{AUTH_STRINGS.signUp.nameLabel}</span>
                  <span className={styles.detailValue}>{submittedDetails.name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{AUTH_STRINGS.signUp.emailLabel}</span>
                  <span className={styles.detailValue}>{submittedDetails.email}</span>
                </div>
                {submittedDetails.designation && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>
                      {AUTH_STRINGS.signUp.designationLabel}
                    </span>
                    <span className={styles.detailValue}>{submittedDetails.designation}</span>
                  </div>
                )}
                {submittedDetails.employeeId && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>
                      {AUTH_STRINGS.signUp.employeeIdLabel}
                    </span>
                    <span className={styles.detailValue}>{submittedDetails.employeeId}</span>
                  </div>
                )}
              </div>

              <p className={styles.successExplanation}>{AUTH_STRINGS.signUp.successExplanation}</p>

              <Link href="/login" className={styles.submitBtn}>
                <span>{AUTH_STRINGS.signUp.backToHome}</span>
                <ArrowRightIcon size={18} />
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.authCardHeader}>
                <h2 className={styles.authCardTitle}>{AUTH_STRINGS.signUp.title}</h2>
                <p className={styles.authCardSubtitle}>{AUTH_STRINGS.signUp.subtitle}</p>
              </div>

              {errorMessage && (
                <div className={styles.errorBanner} role="alert">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel} htmlFor="signup-name">
                    {AUTH_STRINGS.signUp.nameLabel} *
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIconLeft}>
                      <ContactsIcon size={18} />
                    </span>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={AUTH_STRINGS.signUp.namePlaceholder}
                      className={styles.textInput}
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel} htmlFor="signup-email">
                    {AUTH_STRINGS.signUp.emailLabel} *
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIconLeft}>
                      <MailIcon size={18} />
                    </span>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={AUTH_STRINGS.signUp.emailPlaceholder}
                      className={styles.textInput}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel} htmlFor="signup-designation">
                    {AUTH_STRINGS.signUp.designationLabel}
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIconLeft}>
                      <FileDocIcon size={18} />
                    </span>
                    <input
                      id="signup-designation"
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder={AUTH_STRINGS.signUp.designationPlaceholder}
                      className={styles.textInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel} htmlFor="signup-employee-id">
                    {AUTH_STRINGS.signUp.employeeIdLabel}
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIconLeft}>
                      <ShieldCheckIcon size={18} />
                    </span>
                    <input
                      id="signup-employee-id"
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder={AUTH_STRINGS.signUp.employeeIdPlaceholder}
                      className={styles.textInput}
                    />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                  {isSubmitting ? (
                    <>
                      <div className={styles.spinner} />
                      <span>{AUTH_STRINGS.signUp.submittingBtn}</span>
                    </>
                  ) : (
                    <>
                      <span>{AUTH_STRINGS.signUp.submitBtn}</span>
                      <ArrowRightIcon size={18} />
                    </>
                  )}
                </button>

                <div className={styles.footerRow}>
                  <span>{AUTH_STRINGS.signUp.alreadyHaveAccount}</span>
                  <Link href="/login" className={styles.footerRowLink}>
                    {AUTH_STRINGS.signUp.signInLink}
                  </Link>
                </div>
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
