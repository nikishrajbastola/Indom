"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import AppShell, { type AppShellNavigationItem } from "@/components/layout/AppShell";

const navigation: readonly AppShellNavigationItem[] = [
  { href: "/organization", label: "Overview", icon: "overview" },
  { href: "/organization/tasks", label: "Projects", icon: "projects" },
  { href: "/organization/applicants", label: "Applicants", icon: "applicants" },
  { href: "/organization/analytics", label: "Analytics", icon: "analytics" },
  { href: "/organization/post-task", label: "Post project", icon: "post" },
  { href: "/organization/profile", label: "Profile", icon: "profile" },
  { href: "/organization/verification", label: "Verification", icon: "verification" },
] as const;

const workspaceRoutes = new Set(navigation.map((item) => item.href));

export default function OrganizationShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (!workspaceRoutes.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <AppShell navigation={navigation} workspaceLabel="Organization workspace">
      {children}
    </AppShell>
  );
}
