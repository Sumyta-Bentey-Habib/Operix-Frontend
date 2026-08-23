"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./LoginPage.module.css";
import { useAuth } from "@/context/AuthContext";
import {
  LogoIcon,
  ArrowRightIcon,
  ChatBubbleIcon,
  HeartIcon,
  ShareNetworkIcon,
} from "@/components/icons";

const ROTATING_WORDS = [
  "Healthcare.",
  "Formulations.",
  "Precision.",
  "Innovation.",
  "Compliance.",
  "Excellence.",
];

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Typewriter state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const fullWord = ROTATING_WORDS[currentWordIndex];
    const typingSpeed = isDeleting ? 70 : 120;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedText(fullWord.substring(0, displayedText.length + 1));
        if (displayedText === fullWord) {
          setTimeout(() => setIsDeleting(true), 1600);
        }
      } else {
        setDisplayedText(fullWord.substring(0, displayedText.length - 1));
        if (displayedText === "") {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentWordIndex]);

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
        <div className={styles.brandLogoGroup}>
          <div className={styles.brandLogoIcon}>
            <LogoIcon size={22} />
          </div>
          <div className={styles.brandNameContainer}>
            <span className={styles.brandLogoText}>Operix</span>
            <span className={styles.brandLogoSub}>Apex Pharma</span>
          </div>
        </div>

        <div className={styles.topQuickPills}>
          <span className={styles.topRoleIndicator}>🌿 Pharmaceutical Operations & Governance</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className={styles.mainHeroSection}>
        <h1 className={styles.heroTitle}>Operix</h1>
        <p className={styles.heroSubline}>Healthcare. Precision. Excellence.</p>

        {/* Dynamic Typewriter Word */}
        <div className={styles.dynamicWordWrapper} aria-live="polite">
          <span>{displayedText}</span>
          <span className={styles.cursorBlink}>|</span>
        </div>

        <p className={styles.heroDescription}>
          Join the next generation of pharmaceutical operations & healthcare management — where
          world-class medicine manufacturing meets intelligent financial governance.
        </p>

        {/* Social / Feature Icons Row */}
        <div className={styles.socialIconsRow}>
          <Link
            href="/signin"
            className={styles.socialIconBtn}
            aria-label="Community & Communications"
            title="Communications"
          >
            <ChatBubbleIcon size={22} />
          </Link>
          <Link
            href="/signin"
            className={styles.socialIconBtn}
            aria-label="Healthcare Excellence"
            title="Healthcare Excellence"
          >
            <HeartIcon size={22} />
          </Link>
          <Link
            href="/signin"
            className={styles.socialIconBtn}
            aria-label="Supply Network & Distribution"
            title="Supply Network"
          >
            <ShareNetworkIcon size={22} />
          </Link>
        </div>

        {/* Action Button linking to separate signin form page */}
        <Link
          href="/signin"
          className={styles.journeyPillBtn}
          aria-label="Access Pharma Portal Sign In"
        >
          <span>Access Pharma Portal</span>
          <ArrowRightIcon size={18} />
        </Link>
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
