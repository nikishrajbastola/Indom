"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LogoutButton from "@/components/LogoutButton";

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

export default function AdminOrganizationsPage() {
  const router = useRouter();

  const [organizations, setOrganizations] = useState<OrganizationProfile[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationProfile | null>(null);

  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return;
    }

    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !currentProfile) {
      setMessage(
        profileError?.message || "We could not load your administrator profile."
      );
      setLoading(false);
      return;
    }

    if (currentProfile.role !== "admin") {
      router.replace("/");
      return;
    }

    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        email,
        role,
        verification_status,
        organization_type,
        official_email,
        website,
        description,
        contact_person,
        created_at,
        reviewed_at,
        reviewed_by
        `
      )
      .eq("role", "organization")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("verification_status", filter);
    }

    const { data, error } = await query;

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const loadedOrganizations = (data ?? []) as OrganizationProfile[];

    setOrganizations(loadedOrganizations);

    setSelectedOrganization((currentSelection) => {
      if (!currentSelection) {
        return loadedOrganizations[0] ?? null;
      }

      return (
        loadedOrganizations.find(
          (organization) => organization.id === currentSelection.id
        ) ??
        loadedOrganizations[0] ??
        null
      );
    });

    setLoading(false);
  }, [filter, router]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  async function reviewOrganization(
    organization: OrganizationProfile,
    newStatus: "approved" | "rejected"
  ) {
    const action = newStatus === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${organization.full_name || "this organization"
      }?`
    );

    if (!confirmed) {
      return;
    }

    setReviewingId(organization.id);
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      // Recheck admin status before performing the update.
      const { data: adminProfile, error: adminError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (adminError || adminProfile?.role !== "admin") {
        setMessage("You do not have permission to review organizations.");
        return;
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({
          verification_status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", organization.id)
        .eq("role", "organization")
        .select(
          `
          id,
          full_name,
          email,
          role,
          verification_status,
          organization_type,
          official_email,
          website,
          description,
          contact_person,
          created_at,
          reviewed_at,
          reviewed_by
          `
        )
        .single();

      if (updateError) {
        setMessage(updateError.message);
        return;
      }

      setMessage(
        `${updatedProfile.full_name || "Organization"
        } was ${newStatus} successfully.`
      );

      await loadOrganizations();
    } catch {
      setMessage("Something went wrong while reviewing the organization.");
    } finally {
      setReviewingId(null);
    }
  }

  function formatStatus(status: VerificationStatus) {
    if (!status) {
      return "Not submitted";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function formatOrganizationType(type: string | null) {
    if (!type) {
      return "Not provided";
    }

    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  }

  if (loading) {
    return (
      <main style={centeredPage}>
        <div style={loadingCard}>
          <div style={spinner} />
          <p style={mutedText}>Loading organization applications...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <aside style={sidebar}>
        <Link href="/" style={brand}>
          Indom
        </Link>

        <p style={sidebarLabel}>ADMINISTRATION</p>

        <nav style={nav}>
          <Link href="/admin" style={navItem}>
            Overview
          </Link>

          <Link href="/admin/organizations" style={activeNavItem}>
            Organization Reviews
          </Link>
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "30px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <LogoutButton />
        </div>
      </aside>

      <section style={content}>
        <header style={header}>
          <div>
            <p style={eyebrow}>ADMIN VERIFICATION</p>

            <h1 style={title}>Review organizations.</h1>

            <p style={subtitle}>
              Approve legitimate organizations before they publish student
              opportunities.
            </p>
          </div>

          <button
            type="button"
            style={refreshButton}
            onClick={loadOrganizations}
          >
            Refresh
          </button>
        </header>

        {message && (
          <div
            style={{
              ...messageNotice,
              ...(message.includes("successfully")
                ? successNotice
                : errorNotice),
            }}
          >
            {message}
          </div>
        )}

        <div style={filterRow}>
          {(["pending", "approved", "rejected", "all"] as StatusFilter[]).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                style={{
                  ...filterButton,
                  ...(filter === status ? activeFilterButton : {}),
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>

        <div style={dashboardGrid}>
          <section style={listPanel}>
            <div style={panelHeader}>
              <div>
                <p style={panelEyebrow}>APPLICATIONS</p>
                <h2 style={panelTitle}>
                  {filter === "all"
                    ? "All organizations"
                    : `${formatStatus(filter)} organizations`}
                </h2>
              </div>

              <span style={countBadge}>{organizations.length}</span>
            </div>

            {organizations.length === 0 ? (
              <div style={emptyState}>
                <div style={emptyIcon}>✓</div>
                <h3 style={emptyTitle}>Nothing to review.</h3>
                <p style={emptyText}>
                  No organizations currently match this filter.
                </p>
              </div>
            ) : (
              <div style={organizationList}>
                {organizations.map((organization) => {
                  const selected =
                    selectedOrganization?.id === organization.id;

                  return (
                    <button
                      key={organization.id}
                      type="button"
                      onClick={() => setSelectedOrganization(organization)}
                      style={{
                        ...organizationButton,
                        ...(selected ? selectedOrganizationButton : {}),
                      }}
                    >
                      <div style={organizationButtonTop}>
                        <div>
                          <p style={organizationName}>
                            {organization.full_name || "Unnamed organization"}
                          </p>

                          <p style={organizationType}>
                            {formatOrganizationType(
                              organization.organization_type
                            )}
                          </p>
                        </div>

                        <span
                          style={{
                            ...statusBadge,
                            ...(organization.verification_status === "approved"
                              ? approvedBadge
                              : organization.verification_status === "rejected"
                                ? rejectedBadge
                                : pendingBadge),
                          }}
                        >
                          {formatStatus(organization.verification_status)}
                        </span>
                      </div>

                      <p style={organizationEmail}>
                        {organization.official_email ||
                          organization.email ||
                          "No email provided"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section style={detailsPanel}>
            {!selectedOrganization ? (
              <div style={emptyDetails}>
                <h2 style={panelTitle}>Select an organization.</h2>
                <p style={emptyText}>
                  Choose an application to view its verification details.
                </p>
              </div>
            ) : (
              <>
                <div style={detailsHeader}>
                  <div>
                    <p style={panelEyebrow}>ORGANIZATION DETAILS</p>

                    <h2 style={detailsTitle}>
                      {selectedOrganization.full_name ||
                        "Unnamed organization"}
                    </h2>

                    <p style={detailsType}>
                      {formatOrganizationType(
                        selectedOrganization.organization_type
                      )}
                    </p>
                  </div>

                  <span
                    style={{
                      ...statusBadge,
                      ...(selectedOrganization.verification_status ===
                        "approved"
                        ? approvedBadge
                        : selectedOrganization.verification_status ===
                          "rejected"
                          ? rejectedBadge
                          : pendingBadge),
                    }}
                  >
                    {formatStatus(selectedOrganization.verification_status)}
                  </span>
                </div>

                <div style={detailsGrid}>
                  <DetailItem
                    label="Contact person"
                    value={
                      selectedOrganization.contact_person || "Not provided"
                    }
                  />

                  <DetailItem
                    label="Official email"
                    value={
                      selectedOrganization.official_email ||
                      selectedOrganization.email ||
                      "Not provided"
                    }
                  />

                  <DetailItem
                    label="Submitted"
                    value={formatDate(selectedOrganization.created_at)}
                  />

                  <DetailItem
                    label="Last reviewed"
                    value={formatDate(selectedOrganization.reviewed_at)}
                  />
                </div>

                <div style={detailSection}>
                  <p style={detailLabel}>Website</p>

                  {selectedOrganization.website ? (
                    <a
                      href={selectedOrganization.website}
                      target="_blank"
                      rel="noreferrer"
                      style={websiteLink}
                    >
                      {selectedOrganization.website}
                    </a>
                  ) : (
                    <p style={detailValue}>Not provided</p>
                  )}
                </div>

                <div style={detailSection}>
                  <p style={detailLabel}>Organization description</p>

                  <p style={descriptionText}>
                    {selectedOrganization.description ||
                      "No organization description was provided."}
                  </p>
                </div>

                <div style={reviewNotice}>
                  Review the organization’s website, contact information, and
                  description before making a decision.
                </div>

                <div style={actionRow}>
                  <button
                    type="button"
                    style={{
                      ...rejectButton,
                      ...(reviewingId ? disabledButton : {}),
                    }}
                    disabled={Boolean(reviewingId)}
                    onClick={() =>
                      reviewOrganization(selectedOrganization, "rejected")
                    }
                  >
                    {reviewingId === selectedOrganization.id
                      ? "Updating..."
                      : "Reject"}
                  </button>

                  <button
                    type="button"
                    style={{
                      ...approveButton,
                      ...(reviewingId ? disabledButton : {}),
                    }}
                    disabled={Boolean(reviewingId)}
                    onClick={() =>
                      reviewOrganization(selectedOrganization, "approved")
                    }
                  >
                    {reviewingId === selectedOrganization.id
                      ? "Updating..."
                      : "Approve organization"}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function DetailItem({
  label: itemLabel,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={detailItem}>
      <p style={detailLabel}>{itemLabel}</p>
      <p style={detailValue}>{value}</p>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "260px minmax(0, 1fr)",
  background: "#050505",
  color: "white",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const centeredPage = {
  minHeight: "100vh",
  padding: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#050505",
  color: "white",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const loadingCard = {
  width: "100%",
  maxWidth: "500px",
  padding: "36px",
  borderRadius: "24px",
  textAlign: "center" as const,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const sidebar = {
  minHeight: "100vh",
  padding: "28px",
  background: "#080808",
  borderRight: "1px solid rgba(255,255,255,0.08)",

  display: "flex",
  flexDirection: "column" as const,
};

const brand = {
  display: "block",
  marginBottom: "44px",
  color: "white",
  textDecoration: "none",
  fontSize: "22px",
  fontWeight: 800,
};

const sidebarLabel = {
  margin: "0 0 12px",
  color: "#666",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.14em",
};

const nav = {
  display: "grid",
  gap: "8px",
};

const navItem = {
  padding: "12px 14px",
  borderRadius: "12px",
  color: "#999",
  textDecoration: "none",
};

const activeNavItem = {
  ...navItem,
  color: "white",
  background: "rgba(255,255,255,0.08)",
};

const content = {
  minWidth: 0,
  padding: "48px",
};

const header = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "24px",
  marginBottom: "30px",
};

const eyebrow = {
  margin: 0,
  color: "#c084fc",
  fontSize: "13px",
  fontWeight: 800,
  letterSpacing: "0.15em",
};

const title = {
  margin: "9px 0 12px",
  fontSize: "52px",
  letterSpacing: "-0.05em",
};

const subtitle = {
  margin: 0,
  color: "#999",
  fontSize: "17px",
  lineHeight: 1.6,
};

const refreshButton = {
  padding: "11px 18px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "transparent",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const filterRow = {
  display: "flex",
  gap: "10px",
  marginBottom: "22px",
};

const filterButton = {
  padding: "10px 16px",
  borderRadius: "999px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(255,255,255,0.12)",
  background: "transparent",
  color: "#999",
  fontWeight: 700,
  cursor: "pointer",
};

const activeFilterButton = {
  borderColor: "white",
  background: "white",
  color: "#050505",
};

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(320px, 0.8fr) minmax(480px, 1.2fr)",
  gap: "20px",
  alignItems: "start",
};

const listPanel = {
  minWidth: 0,
  padding: "24px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.09)",
};

const detailsPanel = {
  minWidth: 0,
  padding: "30px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const panelHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  marginBottom: "20px",
};

const panelEyebrow = {
  margin: "0 0 6px",
  color: "#777",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.13em",
};

const panelTitle = {
  margin: 0,
  fontSize: "23px",
};

const countBadge = {
  minWidth: "34px",
  height: "34px",
  padding: "0 10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  color: "#ddd",
  fontWeight: 800,
};

const organizationList = {
  display: "grid",
  gap: "10px",
};

const organizationButton = {
  width: "100%",
  padding: "18px",
  borderRadius: "17px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(255,255,255,0.08)",
  background: "rgba(0,0,0,0.2)",
  color: "white",
  textAlign: "left" as const,
  cursor: "pointer",
};

const selectedOrganizationButton = {
  borderColor: "rgba(192,132,252,0.6)",
  background: "rgba(192,132,252,0.08)",
};

const organizationButtonTop = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px",
};

const organizationName = {
  margin: "0 0 5px",
  fontSize: "16px",
  fontWeight: 800,
};

const organizationType = {
  margin: 0,
  color: "#888",
  fontSize: "13px",
};

const organizationEmail = {
  margin: "13px 0 0",
  color: "#aaa",
  fontSize: "13px",
  overflowWrap: "anywhere" as const,
};

const statusBadge = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 800,
  whiteSpace: "nowrap" as const,
};

const pendingBadge = {
  color: "#fcd34d",
  background: "rgba(245,158,11,0.12)",
};

const approvedBadge = {
  color: "#86efac",
  background: "rgba(34,197,94,0.12)",
};

const rejectedBadge = {
  color: "#fca5a5",
  background: "rgba(239,68,68,0.12)",
};

const detailsHeader = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "20px",
  paddingBottom: "24px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const detailsTitle = {
  margin: "5px 0 7px",
  fontSize: "34px",
  letterSpacing: "-0.04em",
};

const detailsType = {
  margin: 0,
  color: "#999",
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "14px",
  marginTop: "24px",
};

const detailItem = {
  minWidth: 0,
  padding: "17px",
  borderRadius: "15px",
  background: "rgba(0,0,0,0.24)",
};

const detailSection = {
  marginTop: "22px",
};

const detailLabel = {
  margin: "0 0 7px",
  color: "#777",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
};

const detailValue = {
  margin: 0,
  color: "#ddd",
  lineHeight: 1.5,
  overflowWrap: "anywhere" as const,
};

const websiteLink = {
  color: "#c084fc",
  textDecoration: "none",
  overflowWrap: "anywhere" as const,
};

const descriptionText = {
  margin: 0,
  padding: "18px",
  borderRadius: "16px",
  background: "rgba(0,0,0,0.24)",
  color: "#bbb",
  lineHeight: 1.75,
  whiteSpace: "pre-wrap" as const,
};

const reviewNotice = {
  marginTop: "24px",
  padding: "15px 17px",
  borderRadius: "14px",
  color: "#aaa",
  background: "rgba(192,132,252,0.07)",
  border: "1px solid rgba(192,132,252,0.16)",
  lineHeight: 1.55,
};

const actionRow = {
  display: "grid",
  gridTemplateColumns: "0.7fr 1.3fr",
  gap: "12px",
  marginTop: "22px",
};

const rejectButton = {
  padding: "14px 18px",
  borderRadius: "13px",
  border: "1px solid rgba(239,68,68,0.3)",
  background: "rgba(239,68,68,0.08)",
  color: "#fca5a5",
  fontWeight: 800,
  cursor: "pointer",
};

const approveButton = {
  padding: "14px 18px",
  borderRadius: "13px",
  border: "none",
  background: "white",
  color: "#050505",
  fontWeight: 800,
  cursor: "pointer",
};

const disabledButton = {
  opacity: 0.55,
  cursor: "not-allowed",
};

const emptyState = {
  padding: "46px 20px",
  textAlign: "center" as const,
};

const emptyDetails = {
  padding: "70px 20px",
  textAlign: "center" as const,
};

const emptyIcon = {
  width: "48px",
  height: "48px",
  margin: "0 auto 15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  color: "#86efac",
  background: "rgba(34,197,94,0.1)",
};

const emptyTitle = {
  margin: "0 0 8px",
};

const emptyText = {
  margin: 0,
  color: "#888",
  lineHeight: 1.6,
};

const messageNotice = {
  marginBottom: "20px",
  padding: "14px 16px",
  borderRadius: "13px",
  borderWidth: "1px",
  borderStyle: "solid",
  lineHeight: 1.5,
};

const successNotice = {
  color: "#86efac",
  borderColor: "rgba(34,197,94,0.25)",
  background: "rgba(34,197,94,0.08)",
};

const errorNotice = {
  color: "#fca5a5",
  borderColor: "rgba(239,68,68,0.25)",
  background: "rgba(239,68,68,0.08)",
};

const spinner = {
  width: "34px",
  height: "34px",
  margin: "0 auto 17px",
  borderWidth: "3px",
  borderStyle: "solid",
  borderColor: "rgba(255,255,255,0.15)",
  borderTopColor: "white",
  borderRadius: "50%",
};

const mutedText = {
  margin: 0,
  color: "#999",
};