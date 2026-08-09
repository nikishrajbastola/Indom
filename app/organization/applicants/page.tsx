"use client";

import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { supabase } from "@/lib/supabase";

type StudentProfile = { full_name: string | null; email: string | null; resume_url: string | null } | { full_name: string | null; email: string | null; resume_url: string | null }[] | null;
type Task = { title: string; organization_id: string } | { title: string; organization_id: string }[] | null;
type Application = { id: string; status: string | null; message: string | null; student_id: string; profiles: StudentProfile; tasks: Task };

function getStatusLabel(status: string | null) {
  return (status || "applied").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusTone(status: string | null): BadgeTone {
  if (status === "accepted" || status === "completed") return "success";
  if (status === "rejected") return "danger";
  if (status === "under_review" || status === "interviewing") return "info";
  return "warning";
}

export default function OrganizationApplicantsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in to view applicants.");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("applications").select(`id, status, message, student_id, tasks (title, organization_id), profiles:student_id (full_name, email, resume_url)`).order("created_at", { ascending: false });
    if (error) setErrorMessage(error.message);
    else {
      const filtered = (data || []).filter((application) => {
        const task = Array.isArray(application.tasks) ? application.tasks[0] : application.tasks;
        return task?.organization_id === user.id;
      });
      setApplications(filtered);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void fetchApplications(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [fetchApplications]);

  const updateStatus = async (applicationId: string, status: string) => {
    setUpdatingId(applicationId);
    setErrorMessage("");
    const { error } = await supabase.from("applications").update({ status }).eq("id", applicationId);
    if (error) setErrorMessage(error.message);
    else setApplications((current) => current.map((application) => application.id === applicationId ? { ...application, status } : application));
    setUpdatingId(null);
  };

  const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const exportCSV = () => {
    const headers = ["Name", "Email", "Project", "Status", "Message"];
    const rows = applications.map((application) => {
      const task = Array.isArray(application.tasks) ? application.tasks[0] : application.tasks;
      const student = Array.isArray(application.profiles) ? application.profiles[0] : application.profiles;
      return [student?.full_name || "", student?.email || "", task?.title || "", getStatusLabel(application.status), application.message || ""];
    });
    const csvContent = [headers.map(escapeCSV).join(","), ...rows.map((row) => row.map(escapeCSV).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "Indom-applicants.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={workspace.page}>
      <div className={workspace.headerGap}>
        <PageHeader eyebrow="Application workflow" title="Applicants" description="Review students and move applications through a clear decision process." action={<Button variant="secondary" onClick={exportCSV} disabled={applications.length === 0}>Export CSV</Button>} />
      </div>
      {errorMessage && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{errorMessage}</p>}
      {loading ? (
        <div className={workspace.list}>{Array.from({ length: 5 }).map((_, index) => <div className={workspace.row} key={index}><Skeleton style={{ width: "35%", height: 20 }} /><Skeleton style={{ width: 180, height: 32 }} /></div>)}</div>
      ) : applications.length === 0 ? (
        <EmptyState title="No applicants yet" description="Applications will appear here when students apply to your projects." />
      ) : (
        <div className={workspace.list}>
          {applications.map((application) => {
            const task = Array.isArray(application.tasks) ? application.tasks[0] : application.tasks;
            const student = Array.isArray(application.profiles) ? application.profiles[0] : application.profiles;
            const disabled = updatingId === application.id;
            return (
              <article className={workspace.row} key={application.id}>
                <div className={workspace.rowMain}>
                  <div className={workspace.rowHeader}><h2 className={workspace.rowTitle}>{student?.full_name || "Unknown student"}</h2><Badge tone={getStatusTone(application.status)}>{getStatusLabel(application.status)}</Badge></div>
                  <p className={workspace.rowMeta}>{student?.email || "No email available"} · {task?.title || "Untitled project"}</p>
                  <p className={workspace.description}>{application.message || "No application message provided."}</p>
                  {student?.resume_url ? <a className={workspace.link} href={student.resume_url} target="_blank" rel="noreferrer">View resume</a> : <p className={workspace.helper}>No resume uploaded</p>}
                </div>
                <div className={workspace.actions} aria-label={`Update ${student?.full_name || "applicant"} status`}>
                  <Button size="small" variant="secondary" disabled={disabled} onClick={() => void updateStatus(application.id, "under_review")}>Review</Button>
                  <Button size="small" variant="secondary" disabled={disabled} onClick={() => void updateStatus(application.id, "interviewing")}>Interview</Button>
                  <Button size="small" disabled={disabled} onClick={() => void updateStatus(application.id, "accepted")}>Accept</Button>
                  <Button size="small" variant="danger" disabled={disabled} onClick={() => void updateStatus(application.id, "rejected")}>Reject</Button>
                  <Button size="small" variant="ghost" disabled={disabled} onClick={() => void updateStatus(application.id, "completed")}>Complete</Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
