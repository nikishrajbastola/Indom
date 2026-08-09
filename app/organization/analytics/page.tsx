"use client";

import { useCallback, useEffect, useState } from "react";
import ApplicationStatusChart from "@/components/ApplicationStatusChart";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { supabase } from "@/lib/supabase";

type Task = { id: string; skills: string | null };
type Application = { id: string; status: string | null };
type Metrics = { totalProjects: number; totalApplications: number; pendingApplications: number; acceptedApplications: number; rejectedApplications: number; acceptanceRate: number; topSkills: string[] };
const initialMetrics: Metrics = { totalProjects: 0, totalApplications: 0, pendingApplications: 0, acceptedApplications: 0, rejectedApplications: 0, acceptanceRate: 0, topSkills: [] };

export default function OrganizationAnalyticsPage() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in to view analytics.");
      setLoading(false);
      return;
    }
    const { data: tasks, error: tasksError } = await supabase.from("tasks").select("id, skills").eq("organization_id", user.id);
    if (tasksError) {
      setErrorMessage(tasksError.message);
      setLoading(false);
      return;
    }

    const organizationTasks = (tasks || []) as Task[];
    const taskIds = organizationTasks.map((task) => task.id);
    const skillCounts: Record<string, number> = {};
    organizationTasks.forEach((task) => task.skills?.split(",").forEach((skill) => {
      const cleanSkill = skill.trim();
      if (cleanSkill) skillCounts[cleanSkill] = (skillCounts[cleanSkill] || 0) + 1;
    }));
    const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([skill]) => skill);

    if (taskIds.length === 0) {
      setMetrics({ ...initialMetrics, topSkills });
      setLoading(false);
      return;
    }
    const { data: applications, error: applicationsError } = await supabase.from("applications").select("id, status").in("task_id", taskIds);
    if (applicationsError) {
      setErrorMessage(applicationsError.message);
      setLoading(false);
      return;
    }
    const organizationApplications = (applications || []) as Application[];
    const totalApplications = organizationApplications.length;
    const pendingApplications = organizationApplications.filter((application) => application.status === "pending" || application.status === null).length;
    const acceptedApplications = organizationApplications.filter((application) => application.status === "accepted").length;
    const rejectedApplications = organizationApplications.filter((application) => application.status === "rejected").length;
    setMetrics({
      totalProjects: taskIds.length,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      acceptanceRate: totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0,
      topSkills,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void fetchAnalytics(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [fetchAnalytics]);

  const maxFunnelValue = Math.max(metrics.pendingApplications, metrics.acceptedApplications, metrics.rejectedApplications, 1);
  const metricCards = [
    ["Total projects", metrics.totalProjects],
    ["Applications", metrics.totalApplications],
    ["Pending", metrics.pendingApplications],
    ["Accepted", metrics.acceptedApplications],
    ["Acceptance rate", `${metrics.acceptanceRate}%`],
  ];

  return (
    <div className={workspace.page}>
      <div className={workspace.headerGap}><PageHeader eyebrow="Analytics" title="Organization insights" description="Monitor project performance, application activity, and workflow outcomes." /></div>
      {errorMessage && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{errorMessage}</p>}
      <section className={workspace.grid}>
        {metricCards.map(([label, value]) => <Card key={label}><div className={workspace.metric}>{loading ? <Skeleton style={{ width: 64, height: 34 }} /> : <p className={workspace.metricValue}>{value}</p>}<p className={workspace.metricLabel}>{label}</p></div></Card>)}
      </section>
      <div className={workspace.stack} style={{ marginTop: 24 }}>
        <Card>
          <div className={workspace.cardHeader}><div><p className={workspace.eyebrow}>Application funnel</p><h2 className={workspace.sectionTitle}>Applications by status</h2></div><Badge tone="info">{metrics.totalApplications} total</Badge></div>
          <div className={workspace.stack}>
            <FunnelRow label="Pending" value={metrics.pendingApplications} max={maxFunnelValue} />
            <FunnelRow label="Accepted" value={metrics.acceptedApplications} max={maxFunnelValue} />
            <FunnelRow label="Rejected" value={metrics.rejectedApplications} max={maxFunnelValue} />
          </div>
        </Card>
        <div className={workspace.twoColumn}>
          <Card><p className={workspace.eyebrow}>Status chart</p><h2 className={workspace.sectionTitle}>Application breakdown</h2><ApplicationStatusChart pending={metrics.pendingApplications} accepted={metrics.acceptedApplications} rejected={metrics.rejectedApplications} /></Card>
          <Card><p className={workspace.eyebrow}>Skill insights</p><h2 className={workspace.sectionTitle}>Top skills requested</h2><div className={workspace.list}>{metrics.topSkills.length === 0 ? <p className={workspace.muted}>No skills listed yet.</p> : metrics.topSkills.map((skill, index) => <div className={workspace.row} key={skill}><span className={workspace.rowTitle}>{skill}</span><Badge>#{index + 1}</Badge></div>)}</div></Card>
        </div>
      </div>
    </div>
  );
}

function FunnelRow({ label, value, max }: { label: string; value: number; max: number }) {
  return <div className={workspace.compactStack}><div className={workspace.rowHeader}><span className={workspace.rowTitle}>{label}</span><span className={workspace.count}>{value}</span></div><div className={workspace.progressTrack}><div className={workspace.progressBar} style={{ width: `${Math.max((value / max) * 100, value > 0 ? 10 : 0)}%` }} /></div></div>;
}
