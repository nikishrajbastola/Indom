"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { supabase } from "@/lib/supabase";

type Organization = { full_name: string | null };
type Task = {
  id: string;
  title: string;
  description: string;
  profiles: Organization | Organization[] | null;
};
type Application = {
  id: string;
  status: string | null;
  message: string | null;
  created_at: string | null;
  tasks: Task | Task[] | null;
};

function statusTone(status: string | null): BadgeTone {
  if (status === "accepted" || status === "completed") return "success";
  if (status === "rejected") return "danger";
  if (status === "pending") return "warning";
  return "neutral";
}

function formatStatus(status: string | null) {
  return (status || "pending").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in to view applications.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("applications")
      .select(`id, status, message, created_at, tasks (id, title, description, profiles:organization_id (full_name))`)
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (error) setErrorMessage(error.message);
    else setApplications(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadApplications(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadApplications]);

  return (
    <div className={workspace.page}>
      <div className={workspace.headerGap}>
        <PageHeader eyebrow="Application tracking" title="My applications" description="Follow each application from submission through the organization’s decision." />
      </div>

      {errorMessage && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{errorMessage}</p>}

      {loading ? (
        <div className={workspace.list} aria-label="Loading applications">
          {Array.from({ length: 4 }).map((_, index) => <div className={workspace.row} key={index}><div className={workspace.grow}><Skeleton style={{ width: "45%", height: 18 }} /><Skeleton style={{ width: "70%", height: 14, marginTop: 10 }} /></div><Skeleton style={{ width: 80, height: 26 }} /></div>)}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState title="No applications yet" description="Browse projects and apply when you find a strong match." action={<ButtonLink href="/student/projects">Browse projects</ButtonLink>} />
      ) : (
        <div className={workspace.list}>
          {applications.map((application) => {
            const task = Array.isArray(application.tasks) ? application.tasks[0] : application.tasks;
            const organization = task ? (Array.isArray(task.profiles) ? task.profiles[0] : task.profiles) : null;
            return (
              <article className={workspace.row} key={application.id}>
                <div className={workspace.rowMain}>
                  <h2 className={workspace.rowTitle}>{task?.title || "Untitled project"}</h2>
                  <p className={workspace.rowMeta}>{organization?.full_name || "Organization"} · Applied {formatDate(application.created_at)}</p>
                  {application.message && <p className={workspace.description}>{application.message}</p>}
                </div>
                <div className={workspace.actions}>
                  <Badge tone={statusTone(application.status)}>{formatStatus(application.status)}</Badge>
                  {task?.id && <Link className={workspace.link} href={`/student/projects/${task.id}`}>View project</Link>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
