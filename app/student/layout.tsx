import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <AppShell workspace="student">{children}</AppShell>;
}
