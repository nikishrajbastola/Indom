"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import LogoutButton from "@/components/LogoutButton";
import styles from "./AppShell.module.css";

export type AppShellIcon =
  | "overview"
  | "discover"
  | "applications"
  | "profile"
  | "projects"
  | "post"
  | "applicants"
  | "analytics"
  | "verification"
  | "organizations";

export type AppShellNavigationItem = {
  href: string;
  label: string;
  icon: AppShellIcon;
};

type AppShellProps = {
  children: ReactNode;
  navigation: readonly AppShellNavigationItem[];
  workspaceLabel: string;
};

function NavigationIcon({ name }: { name: AppShellIcon }) {
  if (name === "overview") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
      </svg>
    );
  }

  if (name === "discover") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9z" />
      </svg>
    );
  }

  if (name === "applications") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 5h10M7 9h10M7 13h7M5 3h14a1 1 0 0 1 1 1v16l-4-3H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      </svg>
    );
  }

  if (name === "projects") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7.5h16v11H4zM8 7.5V5h8v2.5M4 12h16" />
      </svg>
    );
  }

  if (name === "post") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (name === "applicants") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.6-3.2 2.4-4.8 5.5-4.8s4.9 1.6 5.5 4.8M16 8h5M18.5 5.5v5" />
      </svg>
    );
  }

  if (name === "analytics") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 19V9M12 19V5M19 19v-7M3 19h18" />
      </svg>
    );
  }

  if (name === "verification") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 19 6v5c0 4.6-2.3 7.7-7 10-4.7-2.3-7-5.4-7-10V6zM9 12l2 2 4-4" />
      </svg>
    );
  }

  if (name === "organizations") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20V7h10v13M14 11h6v9M7 10h4M7 14h4M7 18h4M17 14h1M17 17h1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20c.8-4 3.3-6 7.5-6s6.7 2 7.5 6" />
    </svg>
  );
}

export default function AppShell({
  children,
  navigation,
  workspaceLabel,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const homeHref = navigation[0]?.href ?? "/";

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const isActive = (href: string) =>
    href === homeHref
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const navigationLinks = (mobile = false) => (
    <nav className={styles.navigation} aria-label={`${workspaceLabel} navigation`}>
      {navigation.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${active ? styles.active : ""}`}
            aria-current={active ? "page" : undefined}
            onClick={mobile ? () => setMobileOpen(false) : undefined}
          >
            <span className={styles.navIcon}>
              <NavigationIcon name={item.icon} />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className={`${styles.shell} ${styles.light}`}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>

      <aside className={styles.sidebar}>
        <div>
          <Link href={homeHref} className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              I
            </span>
            <span>Indom</span>
          </Link>
          <p className={styles.workspaceLabel}>{workspaceLabel}</p>
        </div>

        {navigationLinks()}

        <div className={styles.sidebarFooter}>
          <LogoutButton className={styles.logoutButton} />
        </div>
      </aside>

      <header className={styles.mobileHeader}>
        <Link href={homeHref} className={styles.mobileBrand}>
          <span className={styles.brandMark} aria-hidden="true">
            I
          </span>
          <span>Indom</span>
        </Link>

        <button
          type="button"
          className={styles.menuButton}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="app-mobile-navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span aria-hidden="true" className={styles.menuIcon}>
            <span />
            <span />
            <span />
          </span>
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </header>

      {mobileOpen && (
        <>
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            id="app-mobile-navigation"
            className={styles.mobileMenu}
            aria-label="Mobile navigation"
          >
            {navigationLinks(true)}
            <div className={styles.mobileFooter}>
              <LogoutButton className={styles.logoutButton} />
            </div>
          </aside>
        </>
      )}

      <main id="main-content" className={styles.main}>
        {children}
      </main>
    </div>
  );
}
