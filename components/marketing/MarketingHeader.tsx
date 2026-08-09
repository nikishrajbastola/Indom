"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./LandingPage.module.css";

const anchorLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#students", label: "Students" },
  { href: "#organizations", label: "Organizations" },
] as const;

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <header className={styles.siteHeader}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href="/" className={styles.brand} aria-label="Indom home">
            <span className={styles.brandMark} aria-hidden="true">
              I
            </span>
            Indom
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary navigation">
            {anchorLinks.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className={styles.headerActions}>
            <Link href="/login" className={styles.loginLink}>
              Log in
            </Link>
            <Link
              href="/signup?role=student"
              className={styles.headerButton}
              data-analytics-event="student_signup_started"
            >
              Get started
            </Link>
          </div>

          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className={styles.menuIcon} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>

        {mobileOpen && (
          <nav
            id="mobile-navigation"
            className={styles.mobileNav}
            aria-label="Mobile navigation"
          >
            {anchorLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className={styles.mobileNavActions}>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
              <Link
                href="/signup?role=student"
                className={styles.headerButton}
                onClick={() => setMobileOpen(false)}
                data-analytics-event="student_signup_started"
              >
                Get started
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
