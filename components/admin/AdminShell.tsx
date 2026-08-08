"use client";

import type { ReactNode } from "react";
import AppShell, { type AppShellNavigationItem } from "@/components/layout/AppShell";

const navigation: readonly AppShellNavigationItem[] = [
  { href: "/admin/organizations", label: "Organizations", icon: "organizations" },
] as const;

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AppShell navigation={navigation} workspaceLabel="Admin workspace">
      {children}
    </AppShell>
  );
}
