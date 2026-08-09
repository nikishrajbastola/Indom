"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./AppShell.module.css";

type Workspace = "student" | "organization";

type NavigationItem = {
  href: string;
  label: string;
  icon: "home" | "discover" | "applications" | "profile" | "projects" | "analytics" | "post";
};

const studentNavigation: NavigationItem[] = [
  { href: "/student", label: "Overview", icon: "home" },
  { href: "/student/projects", label: "Discover", icon: "discover" },
  { href: "/student/applications", label: "Applications", icon: "applications" },
  { href: "/student/profile", label: "Profile", icon: "profile" },
];

const organizationNavigation: NavigationItem[] = [
  { href: "/organization", label: "Overview", icon: "home" },
  { href: "/organization/tasks", label: "Projects", icon: "projects" },
  { href: "/organization/applicants", label: "Applicants", icon: "applications" },
  { href: "/organization/analytics", label: "Analytics", icon: "analytics" },
  { href: "/organization/post-task", label: "Post project", icon: "post" },
  { href: "/organization/profile", label: "Profile", icon: "profile" },
];

export function AppShell({
  workspace,
  children,
}: {
  workspace: Workspace;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigation = workspace === "student" ? studentNavigation : organizationNavigation;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navigationMarkup = (
    <nav className={styles.navigation} aria-label={`${workspace} workspace`}>
      {navigation.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${active ? styles.active : ""}`}
            aria-current={active ? "page" : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className={styles.shell}>
      <a href="#workspace-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <aside className={styles.sidebar}>
        <Brand />
        <p className={styles.workspaceLabel}>{workspace} workspace</p>
        {navigationMarkup}
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <NavIcon name="logout" />
            <span>{loggingOut ? "Logging out…" : "Log out"}</span>
          </button>
        </div>
      </aside>

      <header className={styles.mobileHeader}>
        <Brand />
        <button
          type="button"
          className={styles.menuButton}
          aria-controls="workspace-mobile-menu"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close workspace navigation" : "Open workspace navigation"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span aria-hidden="true" className={styles.menuIcon}>
            <i />
            <i />
            <i />
          </span>
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </header>

      {mobileOpen && (
        <>
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Close workspace navigation"
            onClick={() => setMobileOpen(false)}
          />
          <div id="workspace-mobile-menu" className={styles.mobileMenu}>
            {navigationMarkup}
            <div className={styles.mobileFooter}>
              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <NavIcon name="logout" />
                <span>{loggingOut ? "Logging out…" : "Log out"}</span>
              </button>
            </div>
          </div>
        </>
      )}

      <main id="workspace-content" className={styles.main}>
        {children}
      </main>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label="Indom home">
      <span className={styles.brandMark} aria-hidden="true">I</span>
      <span>Indom</span>
    </Link>
  );
}

function NavIcon({ name }: { name: NavigationItem["icon"] | "logout" }) {
  const paths: Record<string, ReactNode> = {
    home: <><path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" /></>,
    discover: <><circle cx="12" cy="12" r="8" /><path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9z" /></>,
    applications: <><path d="M7 5h10M7 9h10M7 13h7M5 3h14a1 1 0 0 1 1 1v16l-4-3H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20c.8-4 3.3-6 7.5-6s6.7 2 7.5 6" /></>,
    projects: <><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M4 10h16M5 7h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" /></>,
    analytics: <><path d="M5 20V10m7 10V4m7 16v-7" /></>,
    post: <><path d="M12 5v14M5 12h14" /></>,
    logout: <><path d="M10 5H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h5M14 8l4 4-4 4m4-4H9" /></>,
  };

  return (
    <span className={styles.navIcon} aria-hidden="true">
      <svg viewBox="0 0 24 24">{paths[name]}</svg>
    </span>
  );
}
