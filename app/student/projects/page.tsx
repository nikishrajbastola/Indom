"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calculateMatch } from "@/lib/matching/calculateMatch";

type Task = {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  skills: string | null;
  duration: string | null;
  profiles:
    | { full_name: string | null }
    | { full_name: string | null }[]
    | null;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
};

export default function StudentProjectsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appliedTaskIds, setAppliedTaskIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchApplications();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert(userError?.message || "You must be logged in.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("skills")
      .eq("id", user.id)
      .single();

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    const studentSkills = profile?.skills || "";

    const { data, error } = await supabase
      .from("tasks")
      .select(`
        id,
        organization_id,
        title,
        description,
        skills,
        duration,
        profiles:organization_id (
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const rankedTasks: Task[] = (data || [])
      .map((task) => {
        const match = calculateMatch(studentSkills, task.skills);

        return {
          ...task,
          matchPercentage: match.percentage,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    setTasks(rankedTasks);
    setLoading(false);
  };

  const fetchApplications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("applications")
      .select("task_id")
      .eq("student_id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    setAppliedTaskIds(
      (data || []).map((application) => application.task_id)
    );
  };

  const handleApply = async (taskId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to apply.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      alert(profileError.message);
      return;
    }

    if (profile?.role !== "student") {
      alert("Only students can apply to projects.");
      return;
    }

    if (appliedTaskIds.includes(taskId)) {
      alert("You already applied to this project.");
      return;
    }

    const { error } = await supabase.from("applications").insert([
      {
        task_id: taskId,
        student_id: user.id,
        message: "I am interested in this project.",
        status: "pending",
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setAppliedTaskIds((currentIds) => [...currentIds, taskId]);
  };

  return (
    <main style={page}>
      <aside style={sidebar}>
        <Link href="/" style={brand}>
          Indom
        </Link>

        <nav style={nav}>
          <Link href="/student" style={navItem}>
            Overview
          </Link>

          <Link href="/student/projects" style={activeNav}>
            Browse Projects
          </Link>

          <Link href="/student/applications" style={navItem}>
            My Applications
          </Link>

          <Link href="/student/profile" style={navItem}>
            Profile
          </Link>
        </nav>
      </aside>

      <section style={content}>
        <header style={header}>
          <div>
            <p style={eyebrow}>PROJECT MARKETPLACE</p>
            <h1 style={title}>Recommended Projects</h1>
            <p style={subtitle}>
              Projects ranked based on your profile skills.
            </p>
          </div>

          <div style={countPill}>{tasks.length} projects</div>
        </header>

        {loading ? (
          <div style={emptyState}>Loading projects...</div>
        ) : tasks.length === 0 ? (
          <div style={emptyState}>No projects available yet.</div>
        ) : (
          <section style={grid}>
            {tasks.map((task) => {
              const hasApplied = appliedTaskIds.includes(task.id);

              const organization = Array.isArray(task.profiles)
                ? task.profiles[0]
                : task.profiles;

              return (
                <div key={task.id} style={card}>
                  <div>
                    <div style={cardTopRow}>
                      <Link
                        href={`/organization/${task.organization_id}`}
                        style={orgLink}
                      >
                        Posted by{" "}
                        {organization?.full_name || "Unknown organization"}
                      </Link>

                      <span style={matchBadge}>
                        {task.matchPercentage}% Match
                      </span>
                    </div>

                    <h2 style={cardTitle}>{task.title}</h2>

                    <p style={description}>{task.description}</p>

                    {task.matchedSkills.length > 0 && (
                      <div style={skillSection}>
                        <p style={skillLabel}>Matched skills</p>

                        <div style={meta}>
                          {task.matchedSkills.map((skill) => (
                            <span
                              key={`${task.id}-matched-${skill}`}
                              style={matchedChip}
                            >
                              ✓ {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {task.missingSkills.length > 0 && (
                      <div style={skillSection}>
                        <p style={skillLabel}>Skills to develop</p>

                        <div style={meta}>
                          {task.missingSkills.map((skill) => (
                            <span
                              key={`${task.id}-missing-${skill}`}
                              style={missingChip}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={footer}>
                    <div style={meta}>
                      <span style={chip}>
                        {task.skills || "No skills listed"}
                      </span>

                      <span style={chip}>
                        {task.duration || "Flexible"}
                      </span>
                    </div>

                    <button
                      style={hasApplied ? appliedButton : button}
                      onClick={() => handleApply(task.id)}
                      disabled={hasApplied}
                    >
                      {hasApplied ? "Applied" : "Apply"}
                    </button>
                  </div>
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

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "18px",
};

const card = {
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  minHeight: "300px",
  padding: "22px",
  borderRadius: "18px",
  background: "#0d0d0d",
  border: "1px solid rgba(255,255,255,0.08)",
};

const cardTopRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "10px",
};

const orgLink = {
  display: "inline-block",
  color: "#a1a1aa",
  fontSize: "13px",
  fontWeight: 700,
  textDecoration: "none",
};

const matchBadge = {
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.25)",
  color: "#4ade80",
  fontSize: "12px",
  fontWeight: 800,
  whiteSpace: "nowrap" as const,
};

const cardTitle = {
  fontSize: "20px",
  marginBottom: "10px",
};

const description = {
  color: "#9ca3af",
  lineHeight: "1.6",
  fontSize: "14px",
};

const skillSection = {
  marginTop: "18px",
};

const skillLabel = {
  color: "#71717a",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  marginBottom: "8px",
};

const footer = {
  marginTop: "22px",
};

const meta = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap" as const,
  marginBottom: "18px",
};

const chip = {
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#141414",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#a1a1aa",
  fontSize: "12px",
  fontWeight: 600,
};

const matchedChip = {
  ...chip,
  background: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(34,197,94,0.2)",
  color: "#4ade80",
};

const missingChip = {
  ...chip,
  background: "rgba(245,158,11,0.08)",
  border: "1px solid rgba(245,158,11,0.18)",
  color: "#fbbf24",
};

const button = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#141414",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const appliedButton = {
  ...button,
  background: "#0f0f0f",
  color: "#666",
  cursor: "not-allowed",
};

const emptyState = {
  padding: "28px",
  borderRadius: "18px",
  background: "#0d0d0d",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#8f8f8f",
};