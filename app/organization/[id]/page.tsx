"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type OrganizationProfile = {
  full_name: string | null;
  website_url: string | null;
  industry: string | null;
  organization_description: string | null;
};

type Task = {
  id: string;
  title: string;
  description: string;
  skills: string | null;
  duration: string | null;
};

export default function PublicOrganizationProfilePage() {
  const params = useParams();
  const organizationId = params.id as string;

  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appliedTaskIds, setAppliedTaskIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizationProfile();
    fetchStudentApplications();
  }, []);

  const fetchOrganizationProfile = async () => {
    setLoading(true);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, website_url, industry, organization_description")
      .eq("id", organizationId)
      .single();

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("id, title, description, skills, duration")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (tasksError) {
      alert(tasksError.message);
      setLoading(false);
      return;
    }

    setProfile(profileData);
    setTasks(tasksData || []);
    setLoading(false);
  };

  const fetchStudentApplications = async () => {
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

    setAppliedTaskIds(data.map((application) => application.task_id));
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

    setAppliedTaskIds([...appliedTaskIds, taskId]);
  };

  return (
    <main style={page}>
      <nav style={topbar}>
        <Link href="/student/projects" style={backLink}>
          ← Back to projects
        </Link>

        <Link href="/" style={brand}>
          Indom
        </Link>
      </nav>

      {loading ? (
        <section style={content}>
          <div style={emptyState}>Loading organization...</div>
        </section>
      ) : (
        <section style={content}>
          <div style={hero}>
            <p style={eyebrow}>ORGANIZATION PROFILE</p>

            <h1 style={title}>{profile?.full_name || "Organization"}</h1>

            <p style={industry}>{profile?.industry || "Industry not listed"}</p>

            <p style={description}>
              {profile?.organization_description ||
                "This organization has not added a description yet."}
            </p>

            {profile?.website_url && (
              <a href={profile.website_url} target="_blank" style={websiteLink}>
                Visit website
              </a>
            )}
          </div>

          <section>
            <div style={sectionHeader}>
              <h2 style={sectionTitle}>Posted projects</h2>
              <span style={countPill}>{tasks.length} projects</span>
            </div>

            {tasks.length === 0 ? (
              <div style={emptyState}>
                This organization has not posted projects yet.
              </div>
            ) : (
              <div style={grid}>
                {tasks.map((task) => {
                  const hasApplied = appliedTaskIds.includes(task.id);

                  return (
                    <div key={task.id} style={card}>
                      <div>
                        <h3 style={cardTitle}>{task.title}</h3>
                        <p style={taskDescription}>{task.description}</p>

                        <div style={meta}>
                          <span style={chip}>{task.skills || "No skills"}</span>
                          <span style={chip}>{task.duration || "Flexible"}</span>
                        </div>
                      </div>

                      <button
                        style={hasApplied ? appliedButton : button}
                        onClick={() => handleApply(task.id)}
                        disabled={hasApplied}
                      >
                        {hasApplied ? "Applied" : "Apply"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      )}
    </main>
  );
}

const page = {
  minHeight: "100vh",
  background: "#050505",
  color: "white",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const topbar = {
  height: "72px",
  padding: "0 48px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#080808",
};

const backLink = {
  color: "#a1a1aa",
  textDecoration: "none",
  fontSize: "14px",
};

const brand = {
  color: "white",
  textDecoration: "none",
  fontSize: "20px",
  fontWeight: 700,
};

const content = {
  padding: "56px",
  maxWidth: "1100px",
  margin: "0 auto",
};

const hero = {
  padding: "36px",
  borderRadius: "24px",
  background: "#0d0d0d",
  border: "1px solid rgba(255,255,255,0.08)",
  marginBottom: "36px",
};

const eyebrow = {
  color: "#a1a1aa",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.16em",
};

const title = {
  fontSize: "48px",
  margin: "10px 0",
  letterSpacing: "-0.05em",
};

const industry = {
  color: "#d4d4d8",
  fontSize: "16px",
  marginBottom: "18px",
};

const description = {
  color: "#9ca3af",
  lineHeight: "1.7",
  maxWidth: "760px",
  marginBottom: "22px",
};

const websiteLink = {
  color: "#60a5fa",
  textDecoration: "none",
  fontWeight: 700,
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "18px",
};

const sectionTitle = {
  fontSize: "26px",
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
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "18px",
};

const card = {
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  minHeight: "250px",
  padding: "22px",
  borderRadius: "18px",
  background: "#0d0d0d",
  border: "1px solid rgba(255,255,255,0.08)",
};

const cardTitle = {
  fontSize: "20px",
  marginBottom: "10px",
};

const taskDescription = {
  color: "#9ca3af",
  lineHeight: "1.6",
  fontSize: "14px",
};

const meta = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap" as const,
  marginTop: "18px",
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