"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import styles from "@/components/product/Product.module.css";
import { ButtonLink } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";

type Application = { status: string | null };

export default function OrganizationOverviewPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [metrics, setMetrics] = useState({ projects: 0, applicants: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in to view your organization workspace.");
      setLoading(false);
      return;
    }

    const [profileResult, tasksResult] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase.from("tasks").select("id").eq("organization_id", user.id),
    ]);

    const taskIds = (tasksResult.data || []).map((task) => task.id);
    let applications: Application[] = [];

    if (taskIds.length > 0) {
      const applicationResult = await supabase.from("applications").select("status").in("task_id", taskIds);
      if (applicationResult.error) {
        setError("We couldn’t load every part of your organization dashboard.");
      } else {
        applications = (applicationResult.data as Application[] | null) ?? [];
      }
    }

    if (profileResult.error || tasksResult.error) {
      setError("We couldn’t load every part of your organization dashboard.");
    }

    setOrganizationName(profileResult.data?.full_name || "");
    setMetrics({
      projects: taskIds.length,
      applicants: applications.length,
      pending: applications.filter((application) => !application.status || application.status === "pending").length,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadOverview(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadOverview]);

  return (
    <AppShell workspace="organization">
      <div className={styles.page}>
        <PageHeader
          eyebrow="Organization overview"
          title={organizationName ? `Welcome back, ${organizationName}` : "Organization workspace"}
          description="Manage project opportunities, review interested students, and keep your organization profile current."
          action={<ButtonLink href="/organization/post-task">Post project →</ButtonLink>}
        />

        {error && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p>}

        {loading ? (
          <LoadingState label="Loading organization workspace" />
        ) : (
          <>
            <section className={styles.statsGrid} aria-label="Organization overview metrics">
              <StatCard label="Projects" value={metrics.projects} meta="Posted opportunities" icon="projects" />
              <StatCard label="Applicants" value={metrics.applicants} meta="Across your projects" icon="applicants" />
              <StatCard label="Awaiting review" value={metrics.pending} meta="Pending applications" icon="pending" />
            </section>

            <section aria-labelledby="workspace-actions-title">
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Workspace</p>
                  <h2 id="workspace-actions-title">What would you like to do?</h2>
                  <p className={styles.sectionDescription}>Move directly to the work that needs your attention.</p>
                </div>
              </div>

              <div className={styles.quickGrid}>
                <QuickLink href="/organization/tasks" title="Manage projects" description="Review and update the opportunities your organization has posted." icon="projects" />
                <QuickLink href="/organization/applicants" title="Review applicants" description="Move student applications through your existing review workflow." icon="applicants" />
                <QuickLink href="/organization/analytics" title="View real activity" description="Understand applications and requested skills using current data." icon="analytics" />
                <QuickLink href="/organization/profile" title="Update organization profile" description="Help students understand who is behind each project." icon="profile" />
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, meta, icon }: { label: string; value: number; meta: string; icon: "projects" | "applicants" | "pending" }) {
  const icons = {
    projects: <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M4 10h16M5 7h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />,
    applicants: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2" /><path d="M3.5 19c.7-3.5 2.5-5 5.5-5s4.8 1.5 5.5 5M15 15c2.8 0 4.5 1.2 5 4" /></>,
    pending: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>,
  };
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon} aria-hidden="true"><svg viewBox="0 0 24 24">{icons[icon]}</svg></span>
      <div className={styles.statContent}>
        <span className={styles.statLabel}>{label}</span>
        <strong className={styles.statValue}>{value}</strong>
        <span className={styles.statMeta}>{meta}</span>
      </div>
    </div>
  );
}

function QuickLink({ href, title, description, icon }: { href: string; title: string; description: string; icon: "projects" | "applicants" | "analytics" | "profile" }) {
  const icons = {
    projects: <path d="M5 7h14v12H5zM9 7V5h6v2M5 11h14" />,
    applicants: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.7-3.5 2.5-5 5.5-5s4.8 1.5 5.5 5M16 8h4M18 6v4" /></>,
    analytics: <path d="M5 20V10m7 10V4m7 16v-7" />,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20c.8-4 3.3-6 7.5-6s6.7 2 7.5 6" /></>,
  };
  return (
    <Link href={href} className={styles.quickCard}>
      <span aria-hidden="true"><svg viewBox="0 0 24 24">{icons[icon]}</svg></span>
      <strong>{title}</strong>
      <p>{description}</p>
    </Link>
  );
}
