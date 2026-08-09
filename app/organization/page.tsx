"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { supabase } from "@/lib/supabase";

const actions = [
  { href: "/organization/tasks", title: "Manage projects", text: "Review, edit, and maintain projects published by your organization." },
  { href: "/organization/applicants", title: "Review applicants", text: "Move student applications through review, interview, and decision stages." },
  { href: "/organization/analytics", title: "View analytics", text: "Understand application volume, outcomes, and in-demand skills." },
] as const;

export default function OrganizationOverviewPage() {
  const [metrics, setMetrics] = useState({ projects: 0, applicants: 0, accepted: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage("You must be logged in to view this workspace.");
        setLoading(false);
        return;
      }

      const [tasksResult, applicationsResult] = await Promise.all([
        supabase.from("tasks").select("id").eq("organization_id", user.id),
        supabase.from("applications").select("id, status, tasks!inner(organization_id)").eq("tasks.organization_id", user.id),
      ]);

      if (tasksResult.error || applicationsResult.error) {
        setErrorMessage(tasksResult.error?.message || applicationsResult.error?.message || "Overview data could not be loaded.");
      } else {
        const applications = applicationsResult.data || [];
        setMetrics({
          projects: (tasksResult.data || []).length,
          applicants: applications.length,
          accepted: applications.filter((application) => application.status === "accepted" || application.status === "completed").length,
        });
      }
      setLoading(false);
    };

    const initialLoad = window.setTimeout(() => void loadOverview(), 0);
    return () => window.clearTimeout(initialLoad);
  }, []);

  return (
    <div className={workspace.page}>
      <div className={workspace.headerGap}>
        <PageHeader
          eyebrow="Organization dashboard"
          title="Manage your project pipeline"
          description="Publish opportunities, review applicants, and keep collaboration moving."
          action={<ButtonLink href="/organization/post-task">Post project</ButtonLink>}
        />
      </div>

      {errorMessage && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{errorMessage}</p>}

      <section className={workspace.grid} aria-label="Organization metrics">
        {[{ label: "Published projects", value: metrics.projects }, { label: "Total applicants", value: metrics.applicants }, { label: "Accepted or completed", value: metrics.accepted }].map((metric) => (
          <Card key={metric.label}>
            {loading ? <Skeleton style={{ width: 56, height: 34 }} /> : <p className={workspace.metricValue}>{metric.value}</p>}
            <p className={workspace.metricLabel}>{metric.label}</p>
          </Card>
        ))}
      </section>

      <section style={{ marginTop: 24 }}>
        <div className={workspace.toolbar}><div><p className={workspace.eyebrow}>Workspace</p><h2 className={workspace.sectionTitle}>Operational tools</h2></div><Badge tone="info">Organization</Badge></div>
        <div className={workspace.dashboardGrid}>
          {actions.map((action) => (
            <Card key={action.href} className={workspace.card}>
              <h3 className={workspace.cardTitle}>{action.title}</h3>
              <p className={workspace.description}>{action.text}</p>
              <ButtonLink className={workspace.spacer} href={action.href} variant="secondary">Open</ButtonLink>
            </Card>
          ))}
          <Card className={workspace.card}>
            <h3 className={workspace.cardTitle}>Organization profile</h3>
            <p className={workspace.description}>Keep your identity, website, and organization information current for students.</p>
            <ButtonLink className={workspace.spacer} href="/organization/profile" variant="secondary">Manage profile</ButtonLink>
          </Card>
        </div>
      </section>
    </div>
  );
}
