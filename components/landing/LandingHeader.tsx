"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import styles from "./LandingPage.module.css";

const anchorLinks = [
  { href: "#students", label: "For students" },
  { href: "#organizations", label: "For organizations" },
  { href: "#how-it-works", label: "How it works" },
] as const;

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className={styles.siteHeader} id="top">
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link className={styles.brand} href="/" aria-label="Indom home">
          <span aria-hidden="true">I</span>Indom
        </Link>

        <nav className={styles.desktopNavigation} aria-label="Primary navigation">
          {anchorLinks.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          <ButtonLink href="/login" variant="ghost" size="small">Log in</ButtonLink>
          <ButtonLink href="/signup" size="small">Get started</ButtonLink>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="landing-mobile-navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span aria-hidden="true"><i /><i /><i /></span>
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {mobileOpen && (
        <nav id="landing-mobile-navigation" className={styles.mobileNavigation} aria-label="Mobile navigation">
          {anchorLinks.map((item) => <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</a>)}
          <ButtonLink href="/login" variant="secondary" onClick={() => setMobileOpen(false)}>Log in</ButtonLink>
          <ButtonLink href="/signup" onClick={() => setMobileOpen(false)}>Get started</ButtonLink>
        </nav>
      )}
    </header>
  );
}
