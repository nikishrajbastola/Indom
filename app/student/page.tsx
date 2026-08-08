"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApplicationRow,
  InlineError,
  LoadingApplicationRows,
  ProfileStrengthCard,
  ProjectCard,
  ProjectCardSkeleton,
  StatCard,
} from "@/components/dashboard/StudentDashboardCards";
import PageHeader from "@/components/layout/PageHeader";
import type { BadgeTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { supabase } from "@/lib/supabase";
import styles from "./dashboard.module.css";

type Profile = {
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  skills: string | null;
  resume_url: string | null;
};

type Organization = {
  full_name: string | null;
};

type ApplicationTask = {
  title: string | null;
  organization_id: string;
  profiles: Organization | Organization[] | null;
};

type Application = {
  id: string;
  status: string | null;
  created_at: string | null;
  tasks: ApplicationTask | ApplicationTask[] | null;
};

type Project = {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  skills: string | null;
  duration: string | null;
  profiles: Organization | Organization[] | null;
};

type DashboardErrors = {
  profile: boolean;
  applications: boolean;
  projects: boolean;
};

const initialErrors: DashboardErrors = {
  profile: false,
  applications: false,
  projects: false,
};

function getRelatedRow<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function getProfileCompletion(profile: Profile | null) {
  if (!profile) return { completed: 0, total: 8, percentage: 0 };

  const completedFields = [
    hasText(profile.full_name),
    hasText(profile.headline),
    hasText(profile.bio),
    hasText(profile.skills),
    hasText(profile.resume_url),
    hasText(profile.avatar_url),
    hasText(profile.linkedin_url),
    hasText(profile.github_url) || hasText(profile.portfolio_url),
  ].filter(Boolean).length;

  return {
    completed: completedFields,
    total: 8,
    percentage: Math.round((completedFields / 8) * 100),
  };
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatStatus(status: string | null) {
  const labels: Record<string, string> = {
    pending: "Applied",
    under_review: "Under review",
    interviewing: "Interviewing",
    accepted: "Accepted",
    completed: "Completed",
    rejected: "Not selected",
  };

  if (!status) return labels.pending;
  return (
    labels[status] ||
    status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

function getStatusTone(status: string | null): BadgeTone {
  if (status === "accepted" || status === "completed") return "success";
  if (status === "rejected") return "danger";
  if (status === "under_review" || status === "interviewing") {
    return "warning";
  }
  return "info";
}

function formatRelativeDate(value: string | null) {
  if (!value) return "Recently";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Recently";

  const elapsed = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(elapsed / 60_000);
  const hours = Math.floor(elapsed / 3_600_000);
  const days = Math.floor(elapsed / 86_400_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

export default function StudentOverview() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const [errors, setErrors] = useState<DashboardErrors>(initialErrors);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setErrors(initialErrors);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrors({ profile: true, applications: true, projects: true });
      setLoading(false);
      return;
    }

    try {
      const [profileResult, applicationsResult, projectsResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select(
              "full_name, headline, bio, avatar_url, github_url, linkedin_url, portfolio_url, skills, resume_url",
            )
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("applications")
            .select(
              `
                id,
                status,
                created_at,
                tasks (
                  title,
                  organization_id,
                  profiles:organization_id (
                    full_name
                  )
                )
              `,
              { count: "exact" },
            )
            .eq("student_id", user.id)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("tasks")
            .select(
              `
                id,
                organization_id,
                title,
                description,
                skills,
                duration,
                profiles:organization_id (
                  full_name
                )
              `,
            )
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

      if (profileResult.error) {
        setErrors((current) => ({ ...current, profile: true }));
      } else {
        setProfile((profileResult.data as Profile | null) ?? null);
      }

      if (applicationsResult.error) {
        setErrors((current) => ({ ...current, applications: true }));
      } else {
        setApplications(
          (applicationsResult.data as unknown as Application[] | null) ?? [],
        );
        setApplicationCount(applicationsResult.count ?? 0);
      }

      if (projectsResult.error) {
        setErrors((current) => ({ ...current, projects: true }));
      } else {
        setProjects((projectsResult.data as unknown as Project[] | null) ?? []);
      }
    } catch {
      setErrors({ profile: true, applications: true, projects: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(initialLoad);
  }, [loadDashboard]);

  const firstName = useMemo(
    () => profile?.full_name?.trim().split(/\s+/)[0] || "",
    [profile?.full_name],
  );
  const completion = useMemo(() => getProfileCompletion(profile), [profile]);
  const heading = firstName ? `${getGreeting()}, ${firstName}` : "Welcome back";

  return (
    <div className={styles.dashboard}>
      <PageHeader
        eyebrow="Student overview"
        title={heading}
        description="Here's what's happening with your opportunities."
        action={
          <ButtonLink href="/student/projects">
            Browse projects <span aria-hidden="true">→</span>
          </ButtonLink>
        }
      />

      <section className={styles.statsGrid} aria-label="Student overview metrics">
        <StatCard
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M7 5h10M7 9h10M7 13h7M5 3h14a1 1 0 0 1 1 1v16l-4-3H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
            </svg>
          }
          label="Applications"
          value={errors.applications ? "—" : applicationCount ?? 0}
          loading={loading}
          href="/student/applications"
          linkLabel="View applications"
        />
        <StatCard
          icon={
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4.5 20c.8-4 3.3-6 7.5-6s6.7 2 7.5 6" />
            </svg>
          }
          label="Profile strength"
          value={errors.profile ? "—" : `${completion.percentage}%`}
          loading={loading}
          href="/student/profile"
          linkLabel="Complete profile"
        />
      </section>

      <div className={styles.workspaceGrid}>
        <section className={styles.panel} aria-labelledby="applications-heading">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>In progress</p>
              <h2 id="applications-heading">Your applications</h2>
            </div>
            <Link href="/student/applications" className={styles.textLink}>
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>

          {loading ? (
            <LoadingApplicationRows />
          ) : errors.applications ? (
            <InlineError
              message="We couldn't load your applications."
              onRetry={loadDashboard}
            />
          ) : applications.length === 0 ? (
            <EmptyState
              className={styles.emptyState}
              title="No applications yet"
              description="Find a project that matches your interests and start building experience."
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M7 5h10M7 9h10M7 13h7M5 3h14a1 1 0 0 1 1 1v16l-4-3H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
                </svg>
              }
              action={
                <ButtonLink href="/student/projects" variant="secondary" size="small">
                  Browse projects
                </ButtonLink>
              }
            />
          ) : (
            <div>
              {applications.map((application) => {
                const task = getRelatedRow(application.tasks);
                const organization = getRelatedRow(task?.profiles);

                return (
                  <ApplicationRow
                    key={application.id}
                    title={task?.title || "Untitled project"}
                    organization={organization?.full_name || "Organization"}
                    status={formatStatus(application.status)}
                    statusTone={getStatusTone(application.status)}
                    dateLabel={formatRelativeDate(application.created_at)}
                    dateTime={application.created_at || undefined}
                  />
                );
              })}
            </div>
          )}
        </section>

        <ProfileStrengthCard
          loading={loading}
          error={errors.profile}
          completed={completion.completed}
          total={completion.total}
          percentage={completion.percentage}
          onRetry={loadDashboard}
        />
      </div>

      <section className={styles.projectsSection} aria-labelledby="projects-heading">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Discover</p>
            <h2 id="projects-heading">Latest opportunities</h2>
            <p className={styles.sectionDescription}>
              Recently posted projects you can explore now.
            </p>
          </div>
          <Link href="/student/projects" className={styles.textLink}>
            View all projects <span aria-hidden="true">→</span>
          </Link>
        </div>

        {loading ? (
          <div className={styles.projectsGrid} aria-label="Loading projects" role="status">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        ) : errors.projects ? (
          <Card className={styles.stateCard}>
            <InlineError message="We couldn't load projects." onRetry={loadDashboard} />
          </Card>
        ) : projects.length === 0 ? (
          <Card className={styles.stateCard}>
            <EmptyState
              title="No projects available right now"
              description="Check back soon for new opportunities."
              icon={
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" />
                  <path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9z" />
                </svg>
              }
            />
          </Card>
        ) : (
          <div className={styles.projectsGrid}>
            {projects.map((project) => {
              const organization = getRelatedRow(project.profiles);
              const skills = Array.from(
                new Set(
                  (project.skills || "")
                    .split(/[,;]/)
                    .map((skill) => skill.trim())
                    .filter(Boolean),
                ),
              ).slice(0, 3);

              return (
                <ProjectCard
                  key={project.id}
                  href="/student/projects"
                  title={project.title}
                  organization={organization?.full_name || "Organization"}
                  description={
                    project.description || "Explore this opportunity on Indom."
                  }
                  skills={skills}
                  duration={project.duration || "Flexible duration"}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
