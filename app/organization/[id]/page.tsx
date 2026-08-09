"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "@/components/product/Product.module.css";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
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
  const params = useParams<{ id: string }>();
  const organizationId = params.id;
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appliedTaskIds, setAppliedTaskIds] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOrganization = useCallback(async () => {
    setLoading(true);
    setError("");

    const [profileResult, taskResult, authResult] = await Promise.all([
      supabase.from("profiles").select("full_name, website_url, industry, organization_description").eq("id", organizationId).single(),
      supabase.from("tasks").select("id, title, description, skills, duration").eq("organization_id", organizationId).order("created_at", { ascending: false }),
      supabase.auth.getUser(),
    ]);

    if (profileResult.error || taskResult.error) {
      setError("We couldn’t load this organization profile.");
    } else {
      setProfile(profileResult.data);
      setTasks(taskResult.data || []);
    }

    if (authResult.data.user) {
      const applicationResult = await supabase.from("applications").select("task_id").eq("student_id", authResult.data.user.id);
      if (!applicationResult.error) {
        setAppliedTaskIds((applicationResult.data || []).map((application) => application.task_id));
      }
    }

    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadOrganization(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadOrganization]);

  const handleApply = async (taskId: string) => {
    setApplyingId(taskId);
    setError("");
    setSuccess("");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("You must be logged in to apply.");
      setApplyingId(null);
      return;
    }

    const { data: accountProfile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (profileError) {
      setError("We couldn’t verify your student profile.");
      setApplyingId(null);
      return;
    }

    if (accountProfile?.role !== "student") {
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
      { task_id: taskId, student_id: user.id, message: "I am interested in this project.", status: "pending" },
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
    <div className={styles.publicPage}>
      <header className={styles.publicHeader}>
        <Link href="/student/projects">← Back to projects</Link>
        <Link href="/" className={styles.publicBrand} aria-label="Indom home"><span aria-hidden="true">I</span>Indom</Link>
      </header>

      <main className={`${styles.page} ${styles.pageMedium}`}>
        {error && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p>}
        {success && <p className={`${styles.notice} ${styles.noticeSuccess}`} role="status">{success}</p>}

        {loading ? (
          <LoadingState label="Loading organization" />
        ) : (
          <>
            <section className={styles.organizationHero} aria-labelledby="organization-title">
              <p className={styles.sectionEyebrow}>Organization profile</p>
              <h1 id="organization-title">{profile?.full_name || "Organization"}</h1>
              <p className={styles.organizationMeta}>{profile?.industry || "Industry not listed"}</p>
              <p>{profile?.organization_description || "This organization has not added a description yet."}</p>
              {profile?.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer">Visit website →</a>}
            </section>

            <section aria-labelledby="organization-projects-title">
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Open opportunities</p>
                  <h2 id="organization-projects-title">Posted projects</h2>
                </div>
                <Badge tone="info">{tasks.length} {tasks.length === 1 ? "project" : "projects"}</Badge>
              </div>

              {tasks.length === 0 ? (
                <EmptyState title="No projects posted" description="This organization has not posted projects yet." />
              ) : (
                <div className={styles.cardsGrid}>
                  {tasks.map((task) => {
                    const hasApplied = appliedTaskIds.includes(task.id);
                    return (
                      <article key={task.id} className={styles.projectCard}>
                        <div>
                          <p className={styles.cardEyebrow}>{profile?.full_name || "Organization"}</p>
                          <h2>{task.title}</h2>
                          <p className={styles.description}>{task.description}</p>
                          <div className={styles.chips}>
                            <span className={styles.chip}>{task.skills || "Skills flexible"}</span>
                            <span className={styles.chip}>{task.duration || "Flexible duration"}</span>
                          </div>
                        </div>
                        <Button
                          className={styles.fullButton}
                          variant={hasApplied ? "secondary" : "primary"}
                          disabled={hasApplied}
                          loading={applyingId === task.id}
                          onClick={() => handleApply(task.id)}
                        >
                          {hasApplied ? "Applied" : applyingId === task.id ? "Submitting…" : "Apply to project"}
                        </Button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
