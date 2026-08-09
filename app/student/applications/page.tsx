"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import styles from "@/components/product/Product.module.css";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";

type Organization = { full_name: string | null };
type ApplicationTask = {
  title: string;
  description: string;
  profiles: Organization | Organization[] | null;
};
type Application = {
  id: string;
  status: string | null;
  message: string | null;
  created_at: string | null;
  tasks: ApplicationTask | ApplicationTask[] | null;
};

function related<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function statusLabel(status: string | null) {
  const labels: Record<string, string> = {
    pending: "Applied",
    under_review: "Under review",
    interviewing: "Interviewing",
    accepted: "Accepted",
    rejected: "Not selected",
    completed: "Completed",
  };
  return labels[status || "pending"] || status || "Applied";
}

function statusTone(status: string | null): BadgeTone {
  if (status === "accepted" || status === "completed") return "success";
  if (status === "rejected") return "danger";
  if (status === "under_review" || status === "interviewing") return "warning";
  return "info";
}

function formatDate(value: string | null) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in to view your applications.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("applications")
      .select("id, status, message, created_at, tasks(title, description, profiles:organization_id(full_name))")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError("We couldn’t load your applications. Please try again.");
    } else {
      setApplications((data as unknown as Application[] | null) ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadApplications(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadApplications]);

  return (
    <div className={`${styles.page} ${styles.pageMedium}`}>
      <PageHeader
        eyebrow="Application tracking"
        title="Your applications"
        description="Follow each opportunity from submission through the organization’s decision."
      />

      {error && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p>}

      {loading ? (
        <LoadingState label="Loading applications" />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Find a project that matches your interests and start building experience."
          action={<ButtonLink href="/student/projects">Browse projects</ButtonLink>}
        />
      ) : (
        <section className={styles.applicationList} aria-label="Submitted applications">
          {applications.map((application) => {
            const task = related(application.tasks);
            const organization = related(task?.profiles || null);

            return (
              <article key={application.id} className={styles.applicationCard}>
                <div>
                  <h2>{task?.title || "Untitled project"}</h2>
                  <p className={styles.description}>{task?.description || "No project description is available."}</p>
                  <div className={styles.applicationMeta}>
                    <span>{organization?.full_name || "Organization"}</span>
                    <time dateTime={application.created_at || undefined}>{formatDate(application.created_at)}</time>
                  </div>
                </div>
                <Badge tone={statusTone(application.status)}>{statusLabel(application.status)}</Badge>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
