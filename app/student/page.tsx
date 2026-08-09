"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import styles from "@/components/product/Product.module.css";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";

type Profile = {
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  skills: string | null;
  resume_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
};

type Application = {
  id: string;
  status: string | null;
  tasks: { title: string | null } | { title: string | null }[] | null;
};

type Project = {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  skills: string | null;
  duration: string | null;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
};

function related<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function profileCompletion(profile: Profile | null) {
  if (!profile) return 0;
  const values = [
    profile.full_name,
    profile.headline,
    profile.bio,
    profile.skills,
    profile.resume_url,
    profile.avatar_url,
    profile.linkedin_url,
    profile.github_url || profile.portfolio_url,
  ];
  return Math.round((values.filter((value) => Boolean(value?.trim())).length / values.length) * 100);
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

export default function StudentOverview() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in to view your student workspace.");
      setLoading(false);
      return;
    }

    const [profileResult, applicationResult, projectResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, headline, bio, avatar_url, skills, resume_url, github_url, linkedin_url, portfolio_url")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("applications")
        .select("id, status, tasks(title)", { count: "exact" })
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("tasks")
        .select("id, organization_id, title, description, skills, duration, profiles:organization_id(full_name)")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    if (profileResult.error || applicationResult.error || projectResult.error) {
      setError("We couldn’t load every part of your dashboard. Try again in a moment.");
    }

    setProfile((profileResult.data as Profile | null) ?? null);
    setApplications((applicationResult.data as unknown as Application[] | null) ?? []);
    setApplicationCount(applicationResult.count ?? 0);
    setProjects((projectResult.data as unknown as Project[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadDashboard]);

  const firstName = useMemo(
    () => profile?.full_name?.trim().split(/\s+/)[0] || "",
    [profile?.full_name],
  );
  const completion = useMemo(() => profileCompletion(profile), [profile]);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Student overview"
        title={firstName ? `Welcome back, ${firstName}` : "Welcome to your workspace"}
        description="See what’s happening with your applications, profile, and available opportunities."
        action={<ButtonLink href="/student/projects">Browse projects →</ButtonLink>}
      />

      {error && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p>}

      {loading ? (
        <LoadingState label="Loading your workspace" />
      ) : (
        <>
          <section className={styles.statsGrid} aria-label="Student overview metrics">
            <StatCard label="Applications" value={String(applicationCount)} meta="Submitted projects" icon="applications" />
            <StatCard label="Profile strength" value={`${completion}%`} meta="Professional profile" icon="profile" />
            <StatCard label="Latest opportunities" value={String(projects.length)} meta="Recently available" icon="discover" />
          </section>

          <div className={styles.workspaceGrid}>
            <section className={styles.panel} aria-labelledby="recent-applications-title">
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>In progress</p>
                  <h2 id="recent-applications-title">Recent applications</h2>
                </div>
                <Link href="/student/applications" className={styles.textLink}>View all →</Link>
              </div>

              {applications.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  description="Find a project that matches your interests and start building experience."
                  action={<ButtonLink href="/student/projects" variant="secondary" size="small">Browse projects</ButtonLink>}
                />
              ) : (
                <div className={styles.list}>
                  {applications.map((application) => {
                    const task = related(application.tasks);
                    return (
                      <div key={application.id} className={styles.listRow}>
                        <div>
                          <strong>{task?.title || "Untitled project"}</strong>
                          <p>Application activity</p>
                        </div>
                        <Badge tone={statusTone(application.status)}>{statusLabel(application.status)}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className={styles.panel} aria-labelledby="profile-progress-title">
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Your profile</p>
                  <h2 id="profile-progress-title">Ready to be discovered?</h2>
                  <p className={styles.sectionDescription}>A complete profile gives organizations better context about your skills.</p>
                </div>
              </div>
              <div className={styles.funnelRow}>
                <div className={styles.funnelTop}><span>Profile completion</span><span>{completion}%</span></div>
                <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${completion}%` }} /></div>
              </div>
              <ButtonLink href="/student/profile" variant="secondary" size="small" className={styles.fullButton}>Complete profile</ButtonLink>
            </section>
          </div>

          <section className={styles.sectionStack} aria-labelledby="latest-projects-title">
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Discover</p>
                <h2 id="latest-projects-title">Latest opportunities</h2>
                <p className={styles.sectionDescription}>Recently posted projects available to explore.</p>
              </div>
              <Link href="/student/projects" className={styles.textLink}>View all projects →</Link>
            </div>

            {projects.length === 0 ? (
              <EmptyState title="No projects available right now" description="Check back soon for new opportunities." />
            ) : (
              <div className={styles.cardsGrid}>
                {projects.map((project) => {
                  const organization = related(project.profiles);
                  return (
                    <article key={project.id} className={styles.projectCard}>
                      <div>
                        <Link href={`/organization/${project.organization_id}`} className={styles.organizationLink}>
                          {organization?.full_name || "Organization"}
                        </Link>
                        <h3>{project.title}</h3>
                        <p className={styles.description}>{project.description || "Explore this project opportunity on Indom."}</p>
                        <div className={styles.chips}>
                          <span className={styles.chip}>{project.skills || "Skills flexible"}</span>
                          <span className={styles.chip}>{project.duration || "Flexible duration"}</span>
                        </div>
                      </div>
                      <ButtonLink href="/student/projects" variant="secondary" size="small">View project</ButtonLink>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, meta, icon }: { label: string; value: string; meta: string; icon: "applications" | "profile" | "discover" }) {
  const icons = {
    applications: <path d="M7 5h10M7 9h10M7 13h7M5 3h14a1 1 0 0 1 1 1v16l-4-3H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20c.8-4 3.3-6 7.5-6s6.7 2 7.5 6" /></>,
    discover: <><circle cx="12" cy="12" r="8" /><path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9z" /></>,
  };

  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon} aria-hidden="true"><svg viewBox="0 0 24 24">{icons[icon]}</svg></span>
      <div className={styles.statContent}>
        <span className={styles.statLabel}>{label}</span>
        <strong className={styles.statValue}>{value}</strong>
        <span className={styles.statMeta}>{meta}</span>
      </div>
    </div>
  );
}
