import { RoleEntryPage } from "@/components/auth/RoleEntryPage";

const benefits = [
  "Post clearly scoped project opportunities",
  "Review interested student contributors",
  "Manage applications in one workspace",
] as const;

export default function OrganizationAuthPage() {
  return (
    <RoleEntryPage
      role="organization"
      eyebrow="For organizations"
      title="Give meaningful work the momentum it needs."
      description="Share focused projects and connect with students who are ready to contribute and learn through real work."
      benefits={benefits}
    />
  );
}
