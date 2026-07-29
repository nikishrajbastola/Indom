"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type StudentProfile =
  | {
      full_name: string | null;
      email: string | null;
      resume_url: string | null;
    }
  | {
      full_name: string | null;
      email: string | null;
      resume_url: string | null;
    }[]
  | null;

type Task =
  | {
      title: string;
      organization_id: string;
    }
  | {
      title: string;
      organization_id: string;
    }[]
  | null;

type Application = {
  id: string;
  status: string | null;
  message: string | null;
  student_id: string;
  profiles: StudentProfile;
  tasks: Task;
};

export default function OrganizationApplicantsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        message,
        student_id,
        tasks (
          title,
          organization_id
        ),
        profiles:student_id (
          full_name,
          email,
          resume_url
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const filteredApplications =
      data?.filter((application) => {
        const task = Array.isArray(application.tasks)
          ? application.tasks[0]
          : application.tasks;

        return task?.organization_id === user.id;
      }) || [];

    setApplications(filteredApplications);
    setLoading(false);
  };

  const updateStatus = async (applicationId: string, status: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", applicationId);

    if (error) {
      alert(error.message);
      return;
    }

    setApplications((prev) =>
      prev.map((application) =>
        application.id === applicationId
          ? { ...application, status }
          : application
      )
    );
  };

  const getStatusLabel = (status: string | null) => {
    if (status === "under_review") return "UNDER REVIEW";
    if (status === "interviewing") return "INTERVIEWING";
    if (status === "accepted") return "ACCEPTED";
    if (status === "rejected") return "REJECTED";
    if (status === "completed") return "COMPLETED";
    return "APPLIED";
  };

  const escapeCSV = (value: string) => {
    return `"${value.replace(/"/g, '""')}"`;
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Project", "Status", "Message"];

    const rows = applications.map((application) => {
      const task = Array.isArray(application.tasks)
        ? application.tasks[0]
        : application.tasks;

      const student = Array.isArray(application.profiles)
        ? application.profiles[0]
        : application.profiles;

      return [
        student?.full_name || "",
        student?.email || "",
        task?.title || "",
        getStatusLabel(application.status),
        application.message || "",
      ];
    });

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Indom-applicants.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const getStatusStyle = (status: string | null) => {
    const base = {
      padding: "6px 10px",
      borderRadius: "999px",
      fontWeight: 700,
      fontSize: "11px",
      letterSpacing: "0.08em",
      textTransform: "uppercase" as const,
      border: "1px solid rgba(255,255,255,0.08)",
      whiteSpace: "nowrap" as const,
    };

    if (status === "under_review") {
      return {
        ...base,
        background: "rgba(59,130,246,0.08)",
        color: "#93c5fd",
        border: "1px solid rgba(59,130,246,0.2)",
      };
    }

    if (status === "interviewing") {
      return {
        ...base,
        background: "rgba(168,85,247,0.08)",
        color: "#d8b4fe",
        border: "1px solid rgba(168,85,247,0.2)",
      };
    }

    if (status === "accepted") {
      return {
        ...base,
        background: "rgba(34,197,94,0.08)",
        color: "#86efac",
        border: "1px solid rgba(34,197,94,0.2)",
      };
    }

    if (status === "completed") {
      return {
        ...base,
        background: "rgba(20,184,166,0.08)",
        color: "#5eead4",
        border: "1px solid rgba(20,184,166,0.2)",
      };
    }

    if (status === "rejected") {
      return {
        ...base,
        background: "rgba(239,68,68,0.08)",
        color: "#fca5a5",
        border: "1px solid rgba(239,68,68,0.2)",
      };
    }

    return {
      ...base,
      background: "rgba(245,158,11,0.08)",
      color: "#fcd34d",
      border: "1px solid rgba(245,158,11,0.2)",
    };
  };

  return (
    <main style={page}>
      <aside style={sidebar}>
        <Link href="/" style={brand}>
          Indom
        </Link>

        <nav style={nav}>
          <Link href="/organization" style={navItem}>
            Overview
          </Link>

          <Link href="/organization/tasks" style={navItem}>
            My Tasks
          </Link>

          <Link href="/organization/applicants" style={activeNav}>
            Applicants
          </Link>

          <Link href="/organization/post-task" style={navItem}>
            Post Task
          </Link>
        </nav>
      </aside>

      <section style={content}>
        <header style={header}>
          <div>
            <p style={eyebrow}>APPLICATION WORKFLOW</p>

            <h1 style={title}>Applicants</h1>

            <p style={subtitle}>
              Track student applications through review, interview, decision,
              and completion stages.
            </p>
          </div>

          <div style={headerActions}>
            <button style={exportButton} onClick={exportCSV}>
              Export CSV
            </button>

            <div style={countPill}>{applications.length} total</div>
          </div>
        </header>

        {loading ? (
          <div style={emptyState}>Loading applicants...</div>
        ) : applications.length === 0 ? (
          <div style={emptyState}>No applications yet.</div>
        ) : (
          <section style={panel}>
            <div style={tableHeader}>
              <span>Student</span>
              <span>Project</span>
              <span>Status</span>
              <span>Workflow Actions</span>
            </div>

            <div style={rows}>
              {applications.map((application) => {
                const task = Array.isArray(application.tasks)
                  ? application.tasks[0]
                  : application.tasks;

                const student = Array.isArray(application.profiles)
                  ? application.profiles[0]
                  : application.profiles;

                return (
                  <div key={application.id} style={row}>
                    <div>
                      <p style={studentName}>
                        {student?.full_name || "Unknown student"}
                      </p>

                      <p style={studentMeta}>
                        {student?.email || "No email available"}
                      </p>

                      {student?.resume_url ? (
                        <a
                          href={student.resume_url}
                          target="_blank"
                          style={resumeLink}
                        >
                          View resume
                        </a>
                      ) : (
                        <p style={muted}>No resume uploaded</p>
                      )}
                    </div>

                    <div>
                      <p style={projectTitle}>
                        {task?.title || "Untitled project"}
                      </p>

                      <p style={message}>
                        {application.message ||
                          "No application message provided."}
                      </p>
                    </div>

                    <div>
                      <span style={getStatusStyle(application.status)}>
                        {getStatusLabel(application.status)}
                      </span>
                    </div>

                    <div style={actions}>
                      <button
                        style={actionButton}
                        onClick={() =>
                          updateStatus(application.id, "under_review")
                        }
                      >
                        Review
                      </button>

                      <button
                        style={actionButton}
                        onClick={() =>
                          updateStatus(application.id, "interviewing")
                        }
                      >
                        Interview
                      </button>

                      <button
                        style={actionButton}
                        onClick={() =>
                          updateStatus(application.id, "accepted")
                        }
                      >
                        Accept
                      </button>

                      <button
                        style={rejectButton}
                        onClick={() =>
                          updateStatus(application.id, "rejected")
                        }
                      >
                        Reject
                      </button>

                      <button
                        style={completeButton}
                        onClick={() =>
                          updateStatus(application.id, "completed")
                        }
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

const page = {
  minHeight: "100vh",
  background: "#050505",
  color: "white",
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const sidebar = {
  borderRight: "1px solid rgba(255,255,255,0.08)",
  padding: "28px",
  background: "#080808",
};

const brand = {
  color: "white",
  textDecoration: "none",
  fontSize: "22px",
  fontWeight: 700,
  marginBottom: "40px",
  display: "block",
};

const nav = {
  display: "grid",
  gap: "10px",
};

const navItem = {
  color: "#8f8f8f",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: "12px",
};

const activeNav = {
  color: "white",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.08)",
};

const content = {
  padding: "48px",
  maxWidth: "1200px",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "28px",
};

const headerActions = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
};

const exportButton = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#111",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const eyebrow = {
  color: "#a1a1aa",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.16em",
};

const title = {
  fontSize: "38px",
  margin: "6px 0",
  letterSpacing: "-0.04em",
};

const subtitle = {
  color: "#8f8f8f",
  fontSize: "16px",
};

const countPill = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#111",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#d4d4d8",
  fontSize: "13px",
  fontWeight: 700,
};

const panel = {
  borderRadius: "18px",
  background: "#0d0d0d",
  border: "1px solid rgba(255,255,255,0.08)",
  overflow: "hidden",
};

const tableHeader = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1.4fr 0.6fr 1.2fr",
  gap: "20px",
  padding: "14px 18px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  color: "#71717a",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const rows = {
  display: "grid",
};

const row = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1.4fr 0.6fr 1.2fr",
  gap: "20px",
  padding: "18px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  alignItems: "center",
};

const studentName = {
  fontSize: "15px",
  fontWeight: 700,
  marginBottom: "4px",
};

const studentMeta = {
  color: "#8f8f8f",
  fontSize: "13px",
  marginBottom: "6px",
};

const resumeLink = {
  color: "#d4d4d8",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: 700,
};

const muted = {
  color: "#666",
  fontSize: "13px",
};

const projectTitle = {
  fontSize: "15px",
  fontWeight: 700,
  marginBottom: "4px",
};

const message = {
  color: "#8f8f8f",
  fontSize: "13px",
  lineHeight: "1.5",
};

const actions = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "8px",
};

const actionButton = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#141414",
  color: "#d4d4d8",
  fontWeight: 700,
  fontSize: "13px",
  cursor: "pointer",
};

const rejectButton = {
  ...actionButton,
  color: "#fca5a5",
};

const completeButton = {
  ...actionButton,
  color: "#5eead4",
};

const emptyState = {
  padding: "28px",
  borderRadius: "18px",
  background: "#0d0d0d",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#8f8f8f",
};