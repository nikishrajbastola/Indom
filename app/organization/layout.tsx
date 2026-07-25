import { ReactNode } from "react";
import RoleGuard from "@/components/auth/RoleGuard";

type OrganizationLayoutProps = {
  children: ReactNode;
};

export default function OrganizationLayout({
  children,
}: OrganizationLayoutProps) {
  return (
    <RoleGuard allowedRole="organization">
      {children}
    </RoleGuard>
  );
}