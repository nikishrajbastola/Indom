"use client";

import { useCallback, useEffect, useState } from "react";
import ApplicationStatusChart from "@/components/ApplicationStatusChart";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import styles from "@/components/product/Product.module.css";
import { LoadingState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";

type Task = { id: string; skills: string | null };
type Application = { id: string; status: string | null };

const initialMetrics = {
  totalProjects: 0,
  totalApplications: 0,
  pendingApplications: 0,
  acceptedApplications: 0,
  rejectedApplications: 0,
  acceptanceRate: 0,
  topSkills: [] as string[],
};

export default function OrganizationAnalyticsPage() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in to view organization activity.");
      setLoading(false);
      return;
    }

    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("id, skills")
      .eq("organization_id", user.id);

    if (taskError) {
      setError("We couldn’t load your organization activity.");
      setLoading(false);
      return;
    }

    const tasks = (taskData || []) as Task[];
    const taskIds = tasks.map((task) => task.id);
    const skillCounts: Record<string, number> = {};

    tasks.forEach((task) => {
      task.skills?.split(",").forEach((skill) => {
        const cleanSkill = skill.trim();
        if (cleanSkill) skillCounts[cleanSkill] = (skillCounts[cleanSkill] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);

    if (taskIds.length === 0) {
      setMetrics({ ...initialMetrics, topSkills });
      setLoading(false);
      return;
    }

    const { data: applicationData, error: applicationError } = await supabase
      .from("applications")
      .select("id, status")
      .in("task_id", taskIds);

    if (applicationError) {
      setError("We couldn’t load application activity.");
      setLoading(false);
      return;
    }

    const applications = (applicationData || []) as Application[];
    const accepted = applications.filter((application) => application.status === "accepted").length;
    const pending = applications.filter((application) => !application.status || application.status === "pending").length;
    const rejected = applications.filter((application) => application.status === "rejected").length;

    setMetrics({
      totalProjects: tasks.length,
      totalApplications: applications.length,
      pendingApplications: pending,
      acceptedApplications: accepted,
      rejectedApplications: rejected,
      acceptanceRate: applications.length > 0 ? Math.round((accepted / applications.length) * 100) : 0,
      topSkills,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadAnalytics(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadAnalytics]);

  const maxFunnelValue = Math.max(metrics.pendingApplications, metrics.acceptedApplications, metrics.rejectedApplications, 1);

  return (
    <AppShell workspace="organization">
      <div className={styles.page}>
        <PageHeader
          eyebrow="Organization activity"
          title="Project and application insights"
          description="A factual view of the projects, applications, statuses, and requested skills already in your workspace."
        />

        {error && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p>}

        {loading ? (
          <LoadingState label="Loading organization activity" />
        ) : (
          <>
            <section className={styles.analyticsGrid} aria-label="Organization metrics">
              <Metric label="Projects" value={metrics.totalProjects} />
              <Metric label="Applications" value={metrics.totalApplications} />
              <Metric label="Pending" value={metrics.pendingApplications} />
              <Metric label="Accepted" value={metrics.acceptedApplications} />
              <Metric label="Acceptance rate" value={`${metrics.acceptanceRate}%`} />
            </section>

            <div className={styles.sectionStack}>
              <section className={styles.panel} aria-labelledby="application-funnel-title">
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.sectionEyebrow}>Application workflow</p>
                    <h2 id="application-funnel-title">Applications by status</h2>
                    <p className={styles.sectionDescription}>Understand where applicants currently sit in your review process.</p>
                  </div>
                </div>
                <div className={styles.funnelList}>
                  <FunnelRow label="Pending" value={metrics.pendingApplications} max={maxFunnelValue} />
                  <FunnelRow label="Accepted" value={metrics.acceptedApplications} max={maxFunnelValue} />
                  <FunnelRow label="Rejected" value={metrics.rejectedApplications} max={maxFunnelValue} />
                </div>
              </section>

              <div className={styles.workspaceGrid}>
                <section className={styles.panel} aria-labelledby="status-chart-title">
                  <div className={styles.sectionHeader}>
                    <div>
                      <p className={styles.sectionEyebrow}>Status chart</p>
                      <h2 id="status-chart-title">Application breakdown</h2>
                    </div>
                  </div>
                  <ApplicationStatusChart pending={metrics.pendingApplications} accepted={metrics.acceptedApplications} rejected={metrics.rejectedApplications} />
                </section>

                <section className={styles.panel} aria-labelledby="skill-insights-title">
                  <div className={styles.sectionHeader}>
                    <div>
                      <p className={styles.sectionEyebrow}>Skill insights</p>
                      <h2 id="skill-insights-title">Top requested skills</h2>
                      <p className={styles.sectionDescription}>Most common skills across your posted projects.</p>
                    </div>
                  </div>
                  <div className={styles.skillsList}>
                    {metrics.topSkills.length === 0 ? <p className={styles.muted}>No skills listed yet.</p> : metrics.topSkills.map((skill, index) => (
                      <div key={skill} className={styles.skillRow}><span className={styles.skillRank}>#{index + 1}</span><span>{skill}</span></div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className={styles.analyticsCard}><p>{label}</p><strong>{value}</strong></div>;
}

function FunnelRow({ label, value, max }: { label: string; value: number; max: number }) {
  const width = `${Math.max((value / max) * 100, value > 0 ? 8 : 0)}%`;
  return (
    <div className={styles.funnelRow}>
      <div className={styles.funnelTop}><span>{label}</span><span>{value}</span></div>
      <div className={styles.barTrack}><div className={styles.barFill} style={{ width }} /></div>
    </div>
  );
}
