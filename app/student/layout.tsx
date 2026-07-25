import { ReactNode } from "react";
import RoleGuard from "@/components/auth/RoleGuard";

type StudentLayoutProps = {
  children: ReactNode;
};

export default function StudentLayout({
  children,
}: StudentLayoutProps) {
  return (
    <RoleGuard allowedRole="student">
      {children}
    </RoleGuard>
  );
}