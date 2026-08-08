"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { supabase } from "@/lib/supabase";

type OrganizationProfile = { full_name: string | null; website_url: string | null; industry: string | null; organization_description: string | null };
type Task = { id: string; title: string; description: string; skills: string | null; duration: string | null };

export default function PublicOrganizationProfilePage() {
  const params = useParams<{ id: string }>();
  const organizationId = params.id;
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appliedTaskIds, setAppliedTaskIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  const loadOrganization = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const [profileResult, tasksResult, applicationsResult] = await Promise.all([
      supabase.from("profiles").select("full_name, website_url, industry, organization_description").eq("id", organizationId).single(),
      supabase.from("tasks").select("id, title, description, skills, duration").eq("organization_id", organizationId).order("created_at", { ascending: false }),
      user ? supabase.from("applications").select("task_id").eq("student_id", user.id) : Promise.resolve({ data: [], error: null }),
    ]);
    if (profileResult.error || tasksResult.error || applicationsResult.error) {
      setErrorMessage(profileResult.error?.message || tasksResult.error?.message || applicationsResult.error?.message || "Organization details could not be loaded.");
    } else {
      setProfile(profileResult.data);
      setTasks(tasksResult.data || []);
      setAppliedTaskIds((applicationsResult.data || []).map((application) => application.task_id));
    }
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadOrganization(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadOrganization]);

  const handleApply = async (taskId: string) => {
    setApplyingId(taskId);
    setErrorMessage("");
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in to apply.");
      setApplyingId(null);
      return;
    }
    const { data: userProfile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profileError || userProfile?.role !== "student") {
      setErrorMessage(profileError?.message || "Only students can apply to projects.");
      setApplyingId(null);
      return;
    }
    if (appliedTaskIds.includes(taskId)) {
      setErrorMessage("You already applied to this project.");
      setApplyingId(null);
      return;
    }
    const { error } = await supabase.from("applications").insert([{ task_id: taskId, student_id: user.id, message: "I am interested in this project.", status: "pending" }]);
    if (error) setErrorMessage(error.message);
    else {
      setAppliedTaskIds((current) => [...current, taskId]);
      setMessage("Application submitted successfully.");
    }
    setApplyingId(null);
  };

  return (
    <main>
      <nav className={workspace.publicTopbar}><Link className={workspace.link} href="/student/projects">← Back to projects</Link><Link className={workspace.brand} href="/">Indom</Link></nav>
      <div className={workspace.page}>
        {loading ? (
          <Card><Skeleton style={{ width: "45%", height: 34 }} /><Skeleton style={{ width: "100%", height: 120, marginTop: 20 }} /></Card>
        ) : !profile ? (
          <EmptyState title="Organization unavailable" description={errorMessage || "This organization profile could not be found."} action={<ButtonLink href="/student/projects">Browse projects</ButtonLink>} />
        ) : (
          <div className={workspace.stack}>
            <Card>
              <PageHeader eyebrow="Organization profile" title={profile.full_name || "Organization"} description={profile.organization_description || "This organization has not added a description yet."} action={profile.industry ? <Badge>{profile.industry}</Badge> : undefined} />
              {profile.website_url && <a className={workspace.link} href={profile.website_url} target="_blank" rel="noreferrer">Visit website</a>}
            </Card>
            {errorMessage && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{errorMessage}</p>}
            {message && <p className={`${workspace.notice} ${workspace.noticeSuccess}`} role="status">{message}</p>}
            <div className={workspace.toolbar}><div><p className={workspace.eyebrow}>Open opportunities</p><h2 className={workspace.sectionTitle}>Posted projects</h2></div><Badge>{tasks.length} projects</Badge></div>
            {tasks.length === 0 ? <EmptyState title="No projects posted" description="This organization has not published any projects yet." /> : (
              <div className={workspace.grid}>{tasks.map((task) => {
                const hasApplied = appliedTaskIds.includes(task.id);
                return <Card key={task.id} className={workspace.card}><h3 className={workspace.cardTitle}>{task.title}</h3><p className={workspace.description}>{task.description}</p><div className={workspace.badges}><Badge>{task.skills || "No skills listed"}</Badge><Badge>{task.duration || "Flexible"}</Badge></div><div className={`${workspace.actions} ${workspace.spacer}`}><Link className={workspace.link} href={`/student/projects/${task.id}`}>View details</Link><Button disabled={hasApplied || applyingId === task.id} onClick={() => void handleApply(task.id)}>{hasApplied ? "Applied" : applyingId === task.id ? "Applying…" : "Apply"}</Button></div></Card>;
              })}</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
