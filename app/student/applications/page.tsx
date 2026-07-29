"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Application = {
  id: string;
  status: string | null;
  message: string | null;
  tasks:
    | {
        title: string;
        description: string;
      }
    | {
        title: string;
        description: string;
      }[]
    | null;
};

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        message,
        tasks (
          title,
          description
        )
      `)
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setApplications(data || []);
  };

  return (
    <main style={page}>
      <aside style={sidebar}>
        <h2 style={brand}>Indom</h2>

        <nav style={nav}>
          <Link href="/student" style={navItem}>Overview</Link>
          <Link href="/student/projects" style={navItem}>Browse Projects</Link>
          <Link href="/student/applications" style={activeNav}>My Applications</Link>
          <Link href="/student/profile" style={navItem}>Profile</Link>
        </nav>
      </aside>

      <section style={content}>
        <p style={eyebrow}>APPLICATION TRACKING</p>
        <h1 style={title}>My Applications</h1>
        <p style={subtitle}>
          Track the projects you applied to and monitor your application status.
        </p>

        {applications.length === 0 ? (
          <div style={emptyCard}>
            <h2 style={cardTitle}>No applications yet</h2>
            <p style={description}>
              Browse projects and apply to start building real-world experience.
            </p>

            <Link href="/student/projects" style={buttonLink}>
              Browse Projects
            </Link>
          </div>
        ) : (
          <section style={list}>
            {applications.map((application) => {
              const task = Array.isArray(application.tasks)
                ? application.tasks[0]
                : application.tasks;

              return (
                <div key={application.id} style={card}>
                  <div>
                    <h2 style={cardTitle}>
                      {task?.title || "Untitled project"}
                    </h2>

                    <p style={description}>
                      {task?.description || "No description available."}
                    </p>
                  </div>

                  <span style={statusBadge}>
                    {application.status || "pending"}
                  </span>
                </div>
              );
            })}
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
  fontSize: "22px",
  marginBottom: "40px",
};

const nav = {
  display: "grid",
  gap: "10px",
};

const navItem = {
  color: "#aaa",
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
};

const eyebrow = {
  color: "#60a5fa",
  fontSize: "13px",
  fontWeight: 800,
  letterSpacing: "0.16em",
};

const title = {
  fontSize: "52px",
  margin: "8px 0",
  letterSpacing: "-0.05em",
};

const subtitle = {
  color: "#aaa",
  fontSize: "18px",
  marginBottom: "32px",
};

const list = {
  display: "grid",
  gap: "16px",
};

const card = {
  padding: "24px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
};

const emptyCard = {
  maxWidth: "620px",
  padding: "28px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const cardTitle = {
  fontSize: "24px",
  marginBottom: "10px",
};

const description = {
  color: "#b5b5b5",
  lineHeight: "1.6",
};

const statusBadge = {
  height: "fit-content",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(96,165,250,0.14)",
  color: "#60a5fa",
  fontWeight: 700,
  fontSize: "13px",
};

const buttonLink = {
  display: "inline-block",
  marginTop: "20px",
  background: "white",
  color: "black",
  padding: "14px 20px",
  borderRadius: "999px",
  textDecoration: "none",
  fontWeight: 700,
};