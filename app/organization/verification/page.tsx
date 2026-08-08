"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField, Select, Textarea, TextInput } from "@/components/ui/FormControls";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { supabase } from "@/lib/supabase";

type VerificationStatus = "pending" | "approved" | "rejected" | null;
type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  verification_status: VerificationStatus;
  organization_type: string | null;
  official_email: string | null;
  website: string | null;
  description: string | null;
  contact_person: string | null;
};

export default function OrganizationVerificationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [website, setWebsite] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [editingApplication, setEditingApplication] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setMessage("");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace("/login?role=organization");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, verification_status, organization_type, official_email, website, description, contact_person")
        .eq("id", user.id)
        .single();
      if (error || !data) {
        setMessage(error?.message || "We could not load your organization profile.");
        setLoading(false);
        return;
      }
      if (data.role !== "organization") {
        router.replace("/student");
        return;
      }
      const loadedProfile = data as Profile;
      setProfile(loadedProfile);
      setVerificationStatus(loadedProfile.verification_status);
      setOrganizationName(loadedProfile.full_name ?? "");
      setOrganizationType(loadedProfile.organization_type ?? "");
      setWebsite(loadedProfile.website ?? "");
      setContactPerson(loadedProfile.contact_person ?? "");
      setOfficialEmail(loadedProfile.official_email ?? loadedProfile.email ?? user.email ?? "");
      setDescription(loadedProfile.description ?? "");
      setLoading(false);
    };
    const initialLoad = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [router]);

  const validateStepOne = () => {
    if (!organizationName.trim()) {
      setMessage("Enter your organization name.");
      return false;
    }
    if (!organizationType) {
      setMessage("Select an organization type.");
      return false;
    }
    if (website.trim()) {
      try { new URL(website.trim()); } catch {
        setMessage("Enter a complete website address, such as https://example.com.");
        return false;
      }
    }
    setMessage("");
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    if (!contactPerson.trim()) return setMessage("Enter the organization contact person.");
    if (!officialEmail.trim()) return setMessage("Enter an official organization email.");
    if (description.trim().length < 40) return setMessage("Provide an organization description of at least 40 characters.");
    setSubmitting(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace("/login?role=organization");
        return;
      }
      const { error } = await supabase.from("profiles").update({
        full_name: organizationName.trim(),
        organization_type: organizationType,
        official_email: officialEmail.trim().toLowerCase(),
        website: website.trim() || null,
        description: description.trim(),
        contact_person: contactPerson.trim(),
        verification_status: "pending",
        reviewed_at: null,
        reviewed_by: null,
      }).eq("id", user.id);
      if (error) setMessage(error.message);
      else {
        setVerificationStatus("pending");
        setEditingApplication(false);
        setMessage("");
      }
    } catch {
      setMessage("Something went wrong while submitting your application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={workspace.centered}><Card className={workspace.loadingCard}><Skeleton style={{ width: 56, height: 56, margin: "0 auto" }} /><p className={workspace.muted}>Loading organization details…</p></Card></div>;
  }

  if (verificationStatus === "approved" && !editingApplication) {
    return <div className={workspace.centered}><EmptyState title="Your organization is approved" description="You can publish projects, review applicants, and manage student collaborations." icon="✓" action={<ButtonLink href="/organization">Go to dashboard</ButtonLink>} /></div>;
  }

  const hasSubmittedApplication = verificationStatus === "pending" && Boolean(profile?.organization_type || organizationType || profile?.contact_person || contactPerson || profile?.description || description);
  if (hasSubmittedApplication && !editingApplication) {
    return (
      <div className={workspace.centered}>
        <Card className={workspace.loadingCard}>
          <Badge tone="warning">Pending review</Badge>
          <h1 className={workspace.sectionTitle}>Your application is under review</h1>
          <p className={workspace.description}>You can publish projects after Indom approves your organization.</p>
          <dl className={workspace.detailGrid}>
            <div className={workspace.detail}><dt>Organization</dt><dd>{organizationName}</dd></div>
            <div className={workspace.detail}><dt>Contact email</dt><dd>{officialEmail}</dd></div>
          </dl>
          <div className={workspace.actions}><ButtonLink href="/organization" variant="secondary">Back to dashboard</ButtonLink><Button variant="secondary" onClick={() => { setEditingApplication(true); setStep(1); }}>Update application</Button></div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${workspace.page} ${workspace.narrowPage}`}>
      <div className={workspace.headerGap}><PageHeader eyebrow="Organization verification" title="Apply to publish opportunities" description="Verification protects students and keeps opportunities credible." action={<Badge tone={verificationStatus === "rejected" ? "danger" : "info"}>Step {step} of 2</Badge>} /></div>
      {verificationStatus === "rejected" && <p className={`${workspace.notice} ${workspace.noticeWarning}`}>Your previous application was not approved. Review the information and submit a new request.</p>}
      {message && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{message}</p>}
      <div className={workspace.twoColumn}>
        <Card>
          <p className={workspace.eyebrow}>Why verification matters</p>
          <h2 className={workspace.sectionTitle}>Trusted opportunities</h2>
          <div className={workspace.stack}>
            <p className={workspace.description}>✓ Students know opportunities come from real groups.</p>
            <p className={workspace.description}>✓ Misleading organization profiles are reduced.</p>
            <p className={workspace.description}>✓ Only approved organizations can publish projects.</p>
          </div>
        </Card>
        <Card>
          {step === 1 ? (
            <div className={workspace.form}>
              <h2 className={workspace.sectionTitle}>Organization information</h2>
              <FormField label="Organization name" htmlFor="organization-name"><TextInput id="organization-name" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Texas State AI Research Lab" /></FormField>
              <FormField label="Organization type" htmlFor="organization-type"><Select id="organization-type" value={organizationType} onChange={(event) => setOrganizationType(event.target.value)}><option value="">Select organization type</option><option value="startup">Startup</option><option value="company">Company</option><option value="research_lab">Research lab</option><option value="student_organization">Student organization</option><option value="nonprofit">Nonprofit</option><option value="university_department">University department</option><option value="other">Other</option></Select></FormField>
              <FormField label="Organization website" htmlFor="website" description="Optional for campus organizations."><TextInput id="website" type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://organization.org" /></FormField>
              <Button onClick={() => { if (validateStepOne()) setStep(2); }}>Continue</Button>
            </div>
          ) : (
            <form className={workspace.form} onSubmit={handleSubmit}>
              <h2 className={workspace.sectionTitle}>Contact and verification details</h2>
              <FormField label="Contact person" htmlFor="contact-person"><TextInput id="contact-person" value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} placeholder="Full name" required /></FormField>
              <FormField label="Official organization email" htmlFor="official-email" description="Use an organization or university address when available."><TextInput id="official-email" type="email" value={officialEmail} onChange={(event) => setOfficialEmail(event.target.value)} placeholder="contact@organization.org" required /></FormField>
              <FormField label="Organization description" htmlFor="verification-description" description={`Minimum 40 characters · ${description.length} entered`}><Textarea id="verification-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={7} minLength={40} required /></FormField>
              <div className={workspace.actions}><Button type="button" variant="secondary" onClick={() => { setMessage(""); setStep(1); }} disabled={submitting}>Back</Button><Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit request"}</Button></div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
