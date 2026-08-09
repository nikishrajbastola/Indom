"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import styles from "@/components/product/Product.module.css";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  skills: string | null;
  duration: string | null;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
};

function related<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default function StudentProjectsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appliedTaskIds, setAppliedTaskIds] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    const tasksResult = await supabase
      .from("tasks")
      .select("id, organization_id, title, description, skills, duration, profiles:organization_id(full_name)")
      .order("created_at", { ascending: false });

    const { data: authData } = await supabase.auth.getUser();
    let applicationIds: string[] = [];

    if (authData.user) {
      const applicationResult = await supabase
        .from("applications")
        .select("task_id")
        .eq("student_id", authData.user.id);

      if (!applicationResult.error) {
        applicationIds = (applicationResult.data || []).map((application) => application.task_id);
      }
    }

    if (tasksResult.error) {
      setError("We couldn’t load projects. Please try again.");
    } else {
      setTasks((tasksResult.data as unknown as Task[] | null) ?? []);
    }

    setAppliedTaskIds(applicationIds);
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadProjects(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadProjects]);

  const handleApply = async (taskId: string) => {
    setError("");
    setSuccess("");
    setApplyingId(taskId);

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("You must be logged in to apply.");
      setApplyingId(null);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setError("We couldn’t verify your student profile.");
      setApplyingId(null);
      return;
    }

    if (profile?.role !== "student") {
      setError("Only student accounts can apply to projects.");
      setApplyingId(null);
      return;
    }

    if (appliedTaskIds.includes(taskId)) {
      setError("You already applied to this project.");
      setApplyingId(null);
      return;
    }

    const { error: applicationError } = await supabase.from("applications").insert([
      {
        task_id: taskId,
        student_id: user.id,
        message: "I am interested in this project.",
        status: "pending",
      },
    ]);

    if (applicationError) {
      setError("We couldn’t submit your application. Please try again.");
      setApplyingId(null);
      return;
    }

    setAppliedTaskIds((current) => [...current, taskId]);
    setSuccess("Application submitted successfully.");
    setApplyingId(null);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Project marketplace"
        title="Discover projects"
        description="Find real-world opportunities where your skills and interests can contribute."
        action={<Badge tone="info">{tasks.length} {tasks.length === 1 ? "project" : "projects"}</Badge>}
      />

      {error && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p>}
      {success && <p className={`${styles.notice} ${styles.noticeSuccess}`} role="status">{success}</p>}

      {loading ? (
        <LoadingState label="Loading projects" />
      ) : tasks.length === 0 ? (
        <EmptyState title="No projects available right now" description="Check back soon for new opportunities." />
      ) : (
        <section className={styles.cardsGrid} aria-label="Available projects">
          {tasks.map((task) => {
            const hasApplied = appliedTaskIds.includes(task.id);
            const organization = related(task.profiles);
            const skills = (task.skills || "")
              .split(/[,;]/)
              .map((skill) => skill.trim())
              .filter(Boolean)
              .slice(0, 4);

            return (
              <article key={task.id} className={styles.projectCard}>
                <div>
                  <Link href={`/organization/${task.organization_id}`} className={styles.organizationLink}>
                    {organization?.full_name || "Organization"}
                  </Link>
                  <h2>{task.title}</h2>
                  <p className={styles.description}>{task.description}</p>
                  <div className={styles.chips}>
                    {skills.length > 0 ? skills.map((skill) => <span key={skill} className={styles.chip}>{skill}</span>) : <span className={styles.chip}>Skills flexible</span>}
                    <span className={styles.chip}>{task.duration || "Flexible duration"}</span>
                  </div>
                </div>
                <Button
                  className={styles.fullButton}
                  variant={hasApplied ? "secondary" : "primary"}
                  onClick={() => handleApply(task.id)}
                  disabled={hasApplied}
                  loading={applyingId === task.id}
                >
                  {hasApplied ? "Applied" : applyingId === task.id ? "Submitting…" : "Apply to project"}
                </Button>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
