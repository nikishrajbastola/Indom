"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { supabase } from "@/lib/supabase";

type VerificationStatus = "pending" | "approved" | "rejected" | null;
type OrganizationProfile = {
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
  created_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
};
type StatusFilter = "pending" | "approved" | "rejected" | "all";

function statusTone(status: VerificationStatus): BadgeTone {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  if (status === "pending") return "warning";
  return "neutral";
}

function formatStatus(status: VerificationStatus) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Not submitted";
}

function formatOrganizationType(type: string | null) {
  return type ? type.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "Not provided";
}

function formatDate(date: string | null) {
  if (!date) return "Not available";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(date));
}

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationProfile[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationProfile | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    setMessage("");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      router.replace("/login");
      return;
    }
    const { data: currentProfile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profileError || !currentProfile) {
      setMessage(profileError?.message || "We could not load your administrator profile.");
      setLoading(false);
      return;
    }
    if (currentProfile.role !== "admin") {
      router.replace("/");
      return;
    }

    let query = supabase.from("profiles").select("id, full_name, email, role, verification_status, organization_type, official_email, website, description, contact_person, created_at, reviewed_at, reviewed_by").eq("role", "organization").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("verification_status", filter);
    const { data, error } = await query;
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    const loadedOrganizations = (data ?? []) as OrganizationProfile[];
    setOrganizations(loadedOrganizations);
    setSelectedOrganization((current) => loadedOrganizations.find((organization) => organization.id === current?.id) ?? loadedOrganizations[0] ?? null);
    setLoading(false);
  }, [filter, router]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadOrganizations(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadOrganizations]);

  const reviewOrganization = async (organization: OrganizationProfile, newStatus: "approved" | "rejected") => {
    const action = newStatus === "approved" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${action} ${organization.full_name || "this organization"}?`)) return;
    setReviewingId(organization.id);
    setMessage("");
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace("/login");
        return;
      }
      const { data: adminProfile, error: adminError } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (adminError || adminProfile?.role !== "admin") {
        setMessage("You do not have permission to review organizations.");
        return;
      }
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({ verification_status: newStatus, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
        .eq("id", organization.id)
        .eq("role", "organization")
        .select("id, full_name, email, role, verification_status, organization_type, official_email, website, description, contact_person, created_at, reviewed_at, reviewed_by")
        .single();
      if (updateError) {
        setMessage(updateError.message);
        return;
      }
      setMessage(`${updatedProfile.full_name || "Organization"} was ${newStatus} successfully.`);
      await loadOrganizations();
    } catch {
      setMessage("Something went wrong while reviewing the organization.");
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) {
    return <div className={workspace.centered}><Card className={workspace.loadingCard}><Skeleton style={{ width: 56, height: 56, margin: "0 auto" }} /><p className={workspace.muted}>Loading organization applications…</p></Card></div>;
  }

  return (
    <div className={workspace.page}>
      <div className={workspace.headerGap}><PageHeader eyebrow="Admin verification" title="Organization reviews" description="Approve legitimate organizations before they publish student opportunities." action={<Button variant="secondary" onClick={() => void loadOrganizations()}>Refresh</Button>} /></div>
      {message && <p className={`${workspace.notice} ${message.includes("successfully") ? workspace.noticeSuccess : workspace.noticeDanger}`} role="status">{message}</p>}
      <div className={workspace.toolbar}>
        <div className={workspace.toolbarGroup} aria-label="Filter organizations">{(["pending", "approved", "rejected", "all"] as StatusFilter[]).map((status) => <Button key={status} size="small" variant={filter === status ? "primary" : "secondary"} onClick={() => setFilter(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Button>)}</div>
        <span className={workspace.count}>{organizations.length} organizations</span>
      </div>
      <div className={workspace.twoColumn}>
        <Card>
          <div className={workspace.cardHeader}><div><p className={workspace.eyebrow}>Applications</p><h2 className={workspace.sectionTitle}>{filter === "all" ? "All organizations" : `${formatStatus(filter)} organizations`}</h2></div><Badge>{organizations.length}</Badge></div>
          {organizations.length === 0 ? <EmptyState title="Nothing to review" description="No organizations currently match this filter." /> : (
            <div className={workspace.selectionList}>{organizations.map((organization) => {
              const selected = selectedOrganization?.id === organization.id;
              return <button key={organization.id} type="button" className={`${workspace.selectionButton} ${selected ? workspace.selectionActive : ""}`} onClick={() => setSelectedOrganization(organization)}><div className={workspace.rowHeader}><span className={workspace.rowTitle}>{organization.full_name || "Unnamed organization"}</span><Badge tone={statusTone(organization.verification_status)}>{formatStatus(organization.verification_status)}</Badge></div><p className={workspace.rowMeta}>{formatOrganizationType(organization.organization_type)} · {organization.official_email || organization.email || "No email"}</p></button>;
            })}</div>
          )}
        </Card>

        <Card>
          {!selectedOrganization ? <EmptyState title="Select an organization" description="Choose an application to view its verification details." /> : (
            <div className={workspace.stack}>
              <div className={workspace.cardHeader}><div><p className={workspace.eyebrow}>Organization details</p><h2 className={workspace.sectionTitle}>{selectedOrganization.full_name || "Unnamed organization"}</h2><p className={workspace.muted}>{formatOrganizationType(selectedOrganization.organization_type)}</p></div><Badge tone={statusTone(selectedOrganization.verification_status)}>{formatStatus(selectedOrganization.verification_status)}</Badge></div>
              <dl className={workspace.detailGrid}>
                <DetailItem label="Contact person" value={selectedOrganization.contact_person || "Not provided"} />
                <DetailItem label="Official email" value={selectedOrganization.official_email || selectedOrganization.email || "Not provided"} />
                <DetailItem label="Submitted" value={formatDate(selectedOrganization.created_at)} />
                <DetailItem label="Last reviewed" value={formatDate(selectedOrganization.reviewed_at)} />
              </dl>
              <div><p className={workspace.eyebrow}>Website</p>{selectedOrganization.website ? <a className={workspace.link} href={selectedOrganization.website} target="_blank" rel="noreferrer">{selectedOrganization.website}</a> : <p className={workspace.muted}>Not provided</p>}</div>
              <div><p className={workspace.eyebrow}>Organization description</p><p className={workspace.description}>{selectedOrganization.description || "No organization description was provided."}</p></div>
              <p className={`${workspace.notice} ${workspace.noticeWarning}`}>Review the website, contact information, and description before making a decision.</p>
              <div className={workspace.actions}><Button variant="danger" disabled={Boolean(reviewingId)} onClick={() => void reviewOrganization(selectedOrganization, "rejected")}>{reviewingId === selectedOrganization.id ? "Updating…" : "Reject"}</Button><Button disabled={Boolean(reviewingId)} onClick={() => void reviewOrganization(selectedOrganization, "approved")}>{reviewingId === selectedOrganization.id ? "Updating…" : "Approve organization"}</Button></div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return <div className={workspace.detail}><dt>{label}</dt><dd>{value}</dd></div>;
}
