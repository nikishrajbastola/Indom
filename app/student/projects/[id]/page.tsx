"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { calculateMatch } from "@/lib/matching/calculateMatch";
import { supabase } from "@/lib/supabase";

type Organization = {
  full_name: string | null;
  industry: string | null;
  website_url: string | null;
  organization_description: string | null;
};

type Project = {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  skills: string | null;
  duration: string | null;
  profiles: Organization | Organization[] | null;
};

export default function StudentProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  const loadProject = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in to view this project.");
      setLoading(false);
      return;
    }

    const [projectResult, profileResult, applicationResult] = await Promise.all([
      supabase
        .from("tasks")
        .select(`id, organization_id, title, description, skills, duration, profiles:organization_id (full_name, industry, website_url, organization_description)`)
        .eq("id", projectId)
        .single(),
      supabase.from("profiles").select("skills").eq("id", user.id).single(),
      supabase.from("applications").select("id").eq("student_id", user.id).eq("task_id", projectId),
    ]);

    if (projectResult.error) {
      setErrorMessage(projectResult.error.message);
    } else {
      setProject(projectResult.data);
      const match = calculateMatch(profileResult.data?.skills || "", projectResult.data.skills);
      setMatchPercentage(match.percentage);
      setMatchedSkills(match.matchedSkills);
      setHasApplied((applicationResult.data || []).length > 0);
      if (profileResult.error || applicationResult.error) {
        setErrorMessage(profileResult.error?.message || applicationResult.error?.message || "Some project details could not be loaded.");
      }
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadProject(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadProject]);

  const handleApply = async () => {
    if (!project) return;
    setApplying(true);
    setErrorMessage("");
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in to apply.");
      setApplying(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profileError || profile?.role !== "student") {
      setErrorMessage(profileError?.message || "Only students can apply to projects.");
      setApplying(false);
      return;
    }

    const { error } = await supabase.from("applications").insert([{
      task_id: project.id,
      student_id: user.id,
      message: "I am interested in this project.",
      status: "pending",
    }]);
    if (error) setErrorMessage(error.message);
    else {
      setHasApplied(true);
      setMessage("Application submitted successfully.");
    }
    setApplying(false);
  };

  if (loading) {
    return <div className={`${workspace.page} ${workspace.narrowPage}`}><Skeleton style={{ width: "30%", height: 16 }} /><Skeleton style={{ width: "70%", height: 36, marginTop: 18 }} /><Card style={{ marginTop: 32 }}><Skeleton style={{ width: "100%", height: 220 }} /></Card></div>;
  }

  if (!project) {
    return <div className={`${workspace.page} ${workspace.narrowPage}`}><EmptyState title="Project unavailable" description={errorMessage || "This project may have been removed or is not available."} action={<ButtonLink href="/student/projects">Back to projects</ButtonLink>} /></div>;
  }

  const organization = Array.isArray(project.profiles) ? project.profiles[0] : project.profiles;
  const skills = (project.skills || "").split(",").map((skill) => skill.trim()).filter(Boolean);

  return (
    <div className={`${workspace.page} ${workspace.narrowPage}`}>
      <div className={workspace.headerGap}>
        <Link className={workspace.link} href="/student/projects">← Back to projects</Link>
        <div style={{ marginTop: 20 }}>
          <PageHeader
            eyebrow={organization?.full_name || "Project opportunity"}
            title={project.title}
            description="Review the project scope and skill fit before submitting your application."
            action={<Badge tone={matchPercentage >= 70 ? "success" : "info"}>{matchPercentage}% match</Badge>}
          />
        </div>
      </div>

      {errorMessage && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{errorMessage}</p>}
      {message && <p className={`${workspace.notice} ${workspace.noticeSuccess}`} role="status">{message}</p>}

      <div className={workspace.twoColumn}>
        <div className={workspace.stack}>
          <Card>
            <h2 className={workspace.sectionTitle}>Project overview</h2>
            <p className={workspace.description}>{project.description}</p>
            <dl className={workspace.detailGrid}>
              <div className={workspace.detail}><dt>Duration</dt><dd>{project.duration || "Flexible"}</dd></div>
              <div className={workspace.detail}><dt>Skill match</dt><dd>{matchPercentage}%</dd></div>
            </dl>
          </Card>
          <Card>
            <h2 className={workspace.sectionTitle}>Skills</h2>
            <div className={workspace.badges}>
              {skills.length > 0 ? skills.map((skill) => <Badge key={skill} tone={matchedSkills.includes(skill.toLowerCase()) ? "success" : "neutral"}>{skill}</Badge>) : <span className={workspace.muted}>No specific skills listed.</span>}
            </div>
            {matchedSkills.length > 0 && <p className={workspace.helper}>Your matching skills: {matchedSkills.join(", ")}</p>}
          </Card>
        </div>

        <Card className={workspace.card}>
          <p className={workspace.eyebrow}>Organization</p>
          <h2 className={workspace.sectionTitle}>{organization?.full_name || "Organization"}</h2>
          <p className={workspace.description}>{organization?.organization_description || "No organization description is available."}</p>
          {organization?.industry && <Badge>{organization.industry}</Badge>}
          <div className={`${workspace.actions} ${workspace.spacer}`}>
            <Link className={workspace.link} href={`/organization/${project.organization_id}`}>View organization</Link>
            <Button onClick={() => void handleApply()} disabled={hasApplied || applying}>{hasApplied ? "Applied" : applying ? "Applying…" : "Apply now"}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
