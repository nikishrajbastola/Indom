"use client";

import type { ReactNode } from "react";
import AppShell, {
  type AppShellNavigationItem,
} from "@/components/layout/AppShell";

const navigation: readonly AppShellNavigationItem[] = [
  { href: "/student", label: "Overview", icon: "overview" },
  { href: "/student/projects", label: "Discover", icon: "discover" },
  {
    href: "/student/applications",
    label: "Applications",
    icon: "applications",
  },
  { href: "/student/profile", label: "Profile", icon: "profile" },
] as const;

type StudentShellProps = {
  children: ReactNode;
};

export default function StudentShell({ children }: StudentShellProps) {
  return (
    <AppShell
      navigation={navigation}
      workspaceLabel="Student workspace"
    >
      {children}
    </AppShell>
  );
}
