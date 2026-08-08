"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { calculateMatch } from "@/lib/matching/calculateMatch";
import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  skills: string | null;
  duration: string | null;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
};

function getOrganization(task: Task) {
  return Array.isArray(task.profiles) ? task.profiles[0] : task.profiles;
}

export default function StudentProjectsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appliedTaskIds, setAppliedTaskIds] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setErrorMessage(userError?.message || "You must be logged in to browse projects.");
      setLoading(false);
      return;
    }

    const [profileResult, tasksResult, applicationsResult] = await Promise.all([
      supabase.from("profiles").select("skills").eq("id", user.id).single(),
      supabase
        .from("tasks")
        .select(`id, organization_id, title, description, skills, duration, profiles:organization_id (full_name)`)
        .order("created_at", { ascending: false }),
      supabase.from("applications").select("task_id").eq("student_id", user.id),
    ]);

    if (profileResult.error || tasksResult.error || applicationsResult.error) {
      setErrorMessage(
        profileResult.error?.message || tasksResult.error?.message || applicationsResult.error?.message || "Projects could not be loaded.",
      );
      setLoading(false);
      return;
    }

    const studentSkills = profileResult.data?.skills || "";
    const rankedTasks: Task[] = (tasksResult.data || [])
      .map((task) => ({ ...task, ...(() => {
        const match = calculateMatch(studentSkills, task.skills);
        return {
          matchPercentage: match.percentage,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
        };
      })() }))
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    setTasks(rankedTasks);
    setAppliedTaskIds((applicationsResult.data || []).map((application) => application.task_id));
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadProjects(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadProjects]);

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

    const { data: profile, error: profileError } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();

    if (profileError || profile?.role !== "student") {
      setErrorMessage(profileError?.message || "Only students can apply to projects.");
      setApplyingId(null);
      return;
    }

    if (appliedTaskIds.includes(taskId)) {
      setErrorMessage("You already applied to this project.");
      setApplyingId(null);
      return;
    }

    const { error } = await supabase.from("applications").insert([{
      task_id: taskId,
      student_id: user.id,
      message: "I am interested in this project.",
      status: "pending",
    }]);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setAppliedTaskIds((current) => [...current, taskId]);
      setMessage("Application submitted successfully.");
    }
    setApplyingId(null);
  };

  return (
    <div className={workspace.page}>
      <div className={workspace.headerGap}>
        <PageHeader
          eyebrow="Project marketplace"
          title="Discover projects"
          description="Explore real opportunities ranked by how closely they match your profile skills."
          action={!loading ? <Badge tone="neutral">{tasks.length} projects</Badge> : undefined}
        />
      </div>

      {errorMessage && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{errorMessage}</p>}
      {message && <p className={`${workspace.notice} ${workspace.noticeSuccess}`} role="status">{message}</p>}

      {loading ? (
        <section className={workspace.grid} aria-label="Loading projects">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className={workspace.card}><Skeleton style={{ width: "35%", height: 18 }} /><Skeleton style={{ width: "78%", height: 24 }} /><Skeleton style={{ width: "100%", height: 72 }} /><Skeleton style={{ width: "100%", height: 42 }} /></Card>
          ))}
        </section>
      ) : tasks.length === 0 ? (
        <EmptyState title="No projects available" description="New opportunities will appear here as organizations publish them." />
      ) : (
        <section className={workspace.grid} aria-label="Available projects">
          {tasks.map((task) => {
            const organization = getOrganization(task);
            const hasApplied = appliedTaskIds.includes(task.id);
            return (
              <Card key={task.id} className={workspace.card}>
                <div className={workspace.cardHeader}>
                  <Link className={workspace.link} href={`/organization/${task.organization_id}`}>
                    {organization?.full_name || "Unknown organization"}
                  </Link>
                  <Badge tone={task.matchPercentage >= 70 ? "success" : "info"}>{task.matchPercentage}% match</Badge>
                </div>
                <div className={workspace.compactStack}>
                  <h2 className={workspace.cardTitle}>{task.title}</h2>
                  <p className={workspace.description}>{task.description}</p>
                </div>
                <div className={workspace.badges}>
                  <Badge>{task.duration || "Flexible duration"}</Badge>
                  {(task.matchedSkills.length ? task.matchedSkills : (task.skills || "").split(",")).filter(Boolean).slice(0, 4).map((skill) => (
                    <Badge key={`${task.id}-${skill.trim()}`} tone={task.matchedSkills.length ? "success" : "neutral"}>{skill.trim()}</Badge>
                  ))}
                </div>
                {task.missingSkills.length > 0 && <p className={workspace.helper}>Skills to develop: {task.missingSkills.join(", ")}</p>}
                <div className={`${workspace.actions} ${workspace.spacer}`}>
                  <Link className={workspace.link} href={`/student/projects/${task.id}`}>View details</Link>
                  <Button disabled={hasApplied || applyingId === task.id} onClick={() => void handleApply(task.id)}>
                    {hasApplied ? "Applied" : applyingId === task.id ? "Applying…" : "Apply"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
