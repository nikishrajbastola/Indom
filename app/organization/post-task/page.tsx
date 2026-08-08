"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField, Textarea, TextInput } from "@/components/ui/FormControls";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { supabase } from "@/lib/supabase";

type VerificationStatus = "pending" | "approved" | "rejected" | null;

export default function PostTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(null);
  const [hasVerificationApplication, setHasVerificationApplication] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkOrganizationAccess = async () => {
      setLoading(true);
      setErrorMessage("");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace("/login?role=organization");
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, verification_status, organization_type, official_email, website, description, contact_person")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setErrorMessage(profileError?.message || "We could not load your organization profile.");
        setLoading(false);
        return;
      }
      if (profile.role !== "organization") {
        router.replace("/student");
        return;
      }
      setVerificationStatus(profile.verification_status as VerificationStatus);
      setHasVerificationApplication(Boolean(profile.organization_type || profile.official_email || profile.website || profile.description || profile.contact_person));
      setLoading(false);
    };
    const initialLoad = window.setTimeout(() => void checkOrganizationAccess(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [router]);

  const handlePostTask = async () => {
    setErrorMessage("");
    setMessage("");
    if (!title.trim() || !description.trim() || !skills.trim() || !duration.trim()) {
      setErrorMessage("Complete the title, description, required skills, and duration before publishing.");
      return;
    }
    setPosting(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace("/login?role=organization");
        return;
      }
      const { data: profile, error: profileError } = await supabase.from("profiles").select("verification_status").eq("id", user.id).single();
      if (profileError) {
        setErrorMessage(profileError.message);
        return;
      }
      if (profile?.verification_status !== "approved") {
        setVerificationStatus(profile?.verification_status as VerificationStatus);
        setErrorMessage("Your organization must be approved before posting projects.");
        return;
      }
      const { error } = await supabase.from("tasks").insert([{
        title: title.trim(),
        description: description.trim(),
        skills: skills.trim(),
        duration: duration.trim(),
        organization_id: user.id,
      }]);
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setMessage("Project published successfully.");
      setTitle("");
      setDescription("");
      setSkills("");
      setDuration("");
    } catch {
      setErrorMessage("Something went wrong while publishing the project.");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <div className={workspace.centered}><Card className={workspace.loadingCard}><Skeleton style={{ width: 56, height: 56, margin: "0 auto" }} /><p className={workspace.muted}>Checking organization verification…</p></Card></div>;
  }

  if (errorMessage && verificationStatus === null) {
    return <div className={workspace.centered}><EmptyState title="We could not verify your account" description={errorMessage} action={<ButtonLink href="/organization">Back to dashboard</ButtonLink>} /></div>;
  }

  if (verificationStatus !== "approved") {
    const isRejected = verificationStatus === "rejected";
    const isPending = verificationStatus === "pending" && hasVerificationApplication;
    return (
      <div className={workspace.centered}>
        <EmptyState
          title={isRejected ? "Update your verification application" : isPending ? "Your organization is under review" : "Verify your organization first"}
          description={isRejected ? "Your previous request was not approved. Review your organization information and submit an updated application." : isPending ? "You can publish projects after the review is approved." : "Only verified organizations can publish student opportunities through Indom."}
          action={<div className={workspace.actions}><ButtonLink href="/organization" variant="secondary">Back</ButtonLink><ButtonLink href="/organization/verification">{isRejected ? "Update application" : isPending ? "View status" : "Start verification"}</ButtonLink></div>}
        />
      </div>
    );
  }

  return (
    <div className={`${workspace.page} ${workspace.narrowPage}`}>
      <div className={workspace.headerGap}>
        <PageHeader eyebrow="New opportunity" title="Post a project" description="Create a focused, credible opportunity students can understand and complete." action={<Badge tone="success">Verified organization</Badge>} />
      </div>
      {errorMessage && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{errorMessage}</p>}
      {message && <p className={`${workspace.notice} ${workspace.noticeSuccess}`} role="status">{message}</p>}
      <Card>
        <div className={workspace.form}>
          <FormField label="Project title" htmlFor="task-title"><TextInput id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Clean and analyze research survey data" /></FormField>
          <FormField label="Description" htmlFor="description" description="Describe the outcome, responsibilities, timeline, and expectations."><Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Explain the work and what a successful result looks like." /></FormField>
          <div className={workspace.formGrid}>
            <FormField label="Skills needed" htmlFor="skills" description="Separate skills with commas."><TextInput id="skills" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Excel, Python, research" /></FormField>
            <FormField label="Expected duration" htmlFor="duration"><TextInput id="duration" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="2 weeks" /></FormField>
          </div>
          <div className={workspace.actions}><Button onClick={() => void handlePostTask()} disabled={posting}>{posting ? "Publishing…" : "Publish project"}</Button><ButtonLink href="/organization/tasks" variant="secondary">Cancel</ButtonLink></div>
        </div>
      </Card>
    </div>
  );
}
