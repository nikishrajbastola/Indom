"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import styles from "@/components/product/Product.module.css";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";

type StudentProfile = { full_name: string | null; email: string | null; resume_url: string | null } | { full_name: string | null; email: string | null; resume_url: string | null }[] | null;
type Task = { title: string; organization_id: string } | { title: string; organization_id: string }[] | null;
type Application = {
  id: string;
  status: string | null;
  message: string | null;
  student_id: string;
  profiles: StudentProfile;
  tasks: Task;
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
    rejected: "Rejected",
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

export default function OrganizationApplicantsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in to review applicants.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("applications")
      .select("id, status, message, student_id, tasks(title, organization_id), profiles:student_id(full_name, email, resume_url)")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError("We couldn’t load applicants. Please try again.");
    } else {
      const filtered = (data || []).filter((application) => related(application.tasks)?.organization_id === user.id);
      setApplications(filtered as unknown as Application[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadApplications(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadApplications]);

  const updateStatus = async (applicationId: string, status: string) => {
    setUpdatingId(applicationId);
    setError("");
    setSuccess("");
    const { error: updateError } = await supabase.from("applications").update({ status }).eq("id", applicationId);

    if (updateError) {
      setError("We couldn’t update this application status.");
      setUpdatingId(null);
      return;
    }

    setApplications((current) => current.map((application) => application.id === applicationId ? { ...application, status } : application));
    setSuccess(`Application moved to ${statusLabel(status).toLowerCase()}.`);
    setUpdatingId(null);
  };

  const exportCSV = () => {
    const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const headers = ["Name", "Email", "Project", "Status", "Message"];
    const rows = applications.map((application) => {
      const task = related(application.tasks);
      const student = related(application.profiles);
      return [student?.full_name || "", student?.email || "", task?.title || "", statusLabel(application.status), application.message || ""];
    });
    const csvContent = [headers.map(escapeCSV).join(","), ...rows.map((row) => row.map(escapeCSV).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "indom-applicants.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell workspace="organization">
      <div className={styles.page}>
        <PageHeader
          eyebrow="Application workflow"
          title="Applicants"
          description="Review student context and move applications through your existing decision workflow."
          action={<Button variant="secondary" onClick={exportCSV} disabled={applications.length === 0}>Export CSV</Button>}
        />

        {error && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p>}
        {success && <p className={`${styles.notice} ${styles.noticeSuccess}`} role="status">{success}</p>}

        {loading ? (
          <LoadingState label="Loading applicants" />
        ) : applications.length === 0 ? (
          <EmptyState title="No applications yet" description="Applications will appear here after students apply to your projects." />
        ) : (
          <section className={styles.tablePanel} aria-label={`${applications.length} applicants`}>
            <div className={styles.tableHeader} aria-hidden="true">
              <span>Student</span><span>Project</span><span>Status</span><span>Workflow actions</span>
            </div>
            {applications.map((application) => {
              const task = related(application.tasks);
              const student = related(application.profiles);
              const updating = updatingId === application.id;

              return (
                <article key={application.id} className={styles.tableRow}>
                  <div className={styles.tableCell} data-label="Student">
                    <strong>{student?.full_name || "Unknown student"}</strong>
                    <p>{student?.email || "No email available"}</p>
                    {student?.resume_url ? <a href={student.resume_url} target="_blank" rel="noreferrer">View resume →</a> : <p className={styles.muted}>No resume uploaded</p>}
                  </div>
                  <div className={styles.tableCell} data-label="Project">
                    <strong>{task?.title || "Untitled project"}</strong>
                    <p>{application.message || "No application message provided."}</p>
                  </div>
                  <div className={styles.tableCell} data-label="Status">
                    <Badge tone={statusTone(application.status)}>{statusLabel(application.status)}</Badge>
                  </div>
                  <div className={`${styles.tableCell} ${styles.rowActions}`} data-label="Workflow actions">
                    <Button size="small" variant="secondary" disabled={updating} onClick={() => updateStatus(application.id, "under_review")}>Review</Button>
                    <Button size="small" variant="secondary" disabled={updating} onClick={() => updateStatus(application.id, "interviewing")}>Interview</Button>
                    <Button size="small" disabled={updating} onClick={() => updateStatus(application.id, "accepted")}>Accept</Button>
                    <Button size="small" variant="danger" disabled={updating} onClick={() => updateStatus(application.id, "rejected")}>Reject</Button>
                    <Button size="small" variant="secondary" disabled={updating} onClick={() => updateStatus(application.id, "completed")}>Complete</Button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </AppShell>
  );
}
