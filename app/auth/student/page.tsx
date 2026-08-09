import { RoleEntryPage } from "@/components/auth/RoleEntryPage";

const benefits = [
  "Discover focused, real-world projects",
  "Apply using your professional profile",
  "Track applications from one workspace",
] as const;

export default function StudentAuthPage() {
  return (
    <RoleEntryPage
      role="student"
      eyebrow="For students"
      title="Your first real project starts here."
      description="Find meaningful project opportunities, contribute your skills, and build experience you can talk about."
      benefits={benefits}
    />
  );
}
