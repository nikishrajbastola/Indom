"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FileInput, FormField, Textarea, TextInput } from "@/components/ui/FormControls";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { supabase } from "@/lib/supabase";

export default function StudentProfilePage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<"save" | "avatar" | "resume" | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in to view your profile.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, headline, bio, avatar_url, github_url, linkedin_url, portfolio_url, skills, resume_url")
      .eq("id", user.id)
      .single();

    if (error) {
      setErrorMessage(error.message);
    } else if (data) {
      setFullName(data.full_name || "");
      setHeadline(data.headline || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || "");
      setGithubUrl(data.github_url || "");
      setLinkedinUrl(data.linkedin_url || "");
      setPortfolioUrl(data.portfolio_url || "");
      setSkills(data.skills || "");
      setResumeUrl(data.resume_url || "");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void fetchProfile(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [fetchProfile]);

  const beginAction = (action: "save" | "avatar" | "resume") => {
    setBusyAction(action);
    setMessage("");
    setErrorMessage("");
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setErrorMessage("Choose a profile photo before uploading.");
      return;
    }
    beginAction("avatar");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in.");
      setBusyAction(null);
      return;
    }

    const filePath = `${user.id}/${Date.now()}-${avatarFile.name}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile);
    if (uploadError) {
      setErrorMessage(uploadError.message);
      setBusyAction(null);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    if (updateError) setErrorMessage(updateError.message);
    else {
      setAvatarUrl(publicUrl);
      setAvatarFile(null);
      setMessage("Profile photo uploaded.");
    }
    setBusyAction(null);
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setErrorMessage("Choose a resume before uploading.");
      return;
    }
    beginAction("resume");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in.");
      setBusyAction(null);
      return;
    }

    const filePath = `${user.id}/${Date.now()}-${resumeFile.name}`;
    const { error: uploadError } = await supabase.storage.from("resumes").upload(filePath, resumeFile);
    if (uploadError) {
      setErrorMessage(uploadError.message);
      setBusyAction(null);
      return;
    }

    const { data } = supabase.storage.from("resumes").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    const { error: updateError } = await supabase.from("profiles").update({ resume_url: publicUrl }).eq("id", user.id);
    if (updateError) setErrorMessage(updateError.message);
    else {
      setResumeUrl(publicUrl);
      setResumeFile(null);
      setMessage("Resume uploaded.");
    }
    setBusyAction(null);
  };

  const saveProfile = async () => {
    beginAction("save");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in.");
      setBusyAction(null);
      return;
    }

    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      headline,
      bio,
      github_url: githubUrl,
      linkedin_url: linkedinUrl,
      portfolio_url: portfolioUrl,
      skills,
    }).eq("id", user.id);

    if (error) setErrorMessage(error.message);
    else setMessage("Profile saved.");
    setBusyAction(null);
  };

  const skillList = skills.split(",").map((skill) => skill.trim()).filter(Boolean);

  return (
    <div className={`${workspace.page} ${workspace.narrowPage}`}>
      <div className={workspace.headerGap}>
        <PageHeader eyebrow="Student profile" title="Professional profile" description="Present your experience, strengths, and work to organizations." />
      </div>

      {errorMessage && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{errorMessage}</p>}
      {message && <p className={`${workspace.notice} ${workspace.noticeSuccess}`} role="status">{message}</p>}

      {loading ? (
        <Card><Skeleton style={{ width: 80, height: 80, borderRadius: "50%" }} /><Skeleton style={{ width: "45%", height: 24 }} /><Skeleton style={{ width: "100%", height: 180 }} /></Card>
      ) : (
        <div className={workspace.stack}>
          <Card>
            <div className={workspace.profileHeader}>
              <div className={workspace.avatar}>
                {avatarUrl ? <Image src={avatarUrl} alt={`${fullName || "Student"} profile`} width={80} height={80} unoptimized /> : (fullName.charAt(0) || "U").toUpperCase()}
              </div>
              <div className={workspace.grow}>
                <h2 className={workspace.sectionTitle}>{fullName || "Your name"}</h2>
                <p className={workspace.description}>{headline || "Add a professional headline"}</p>
                <div className={workspace.badges}>{skillList.slice(0, 6).map((skill) => <Badge key={skill}>{skill}</Badge>)}</div>
              </div>
            </div>
            <div className={workspace.fileBlock}>
              <p className={workspace.helper}>Upload a JPG, PNG, or another browser-supported image. Existing avatar storage behavior is unchanged.</p>
              <FileInput aria-label="Choose profile photo" accept="image/*" onChange={(event) => setAvatarFile(event.target.files?.[0] || null)} />
              {avatarFile && <p className={workspace.helper}>Selected: {avatarFile.name}</p>}
              <div><Button onClick={() => void handleAvatarUpload()} disabled={!avatarFile || busyAction !== null}>{busyAction === "avatar" ? "Uploading…" : "Upload photo"}</Button></div>
            </div>
          </Card>

          <div className={workspace.twoColumn}>
            <Card className={workspace.card}>
              <div><p className={workspace.eyebrow}>Resume</p><h2 className={workspace.sectionTitle}>Experience document</h2></div>
              <p className={workspace.description}>Upload a PDF or Word document for organizations to review.</p>
              <div className={workspace.fileBlock}>
                <FileInput aria-label="Choose resume" accept=".pdf,.doc,.docx" onChange={(event) => setResumeFile(event.target.files?.[0] || null)} />
                {resumeFile && <p className={workspace.helper}>Selected: {resumeFile.name}</p>}
                <Button onClick={() => void handleResumeUpload()} disabled={!resumeFile || busyAction !== null}>{busyAction === "resume" ? "Uploading…" : "Upload resume"}</Button>
              </div>
              {resumeUrl && <a className={workspace.link} href={resumeUrl} target="_blank" rel="noreferrer">View uploaded resume</a>}
            </Card>

            <Card>
              <div><p className={workspace.eyebrow}>About</p><h2 className={workspace.sectionTitle}>Professional information</h2></div>
              <div className={workspace.form}>
                <FormField label="Full name" htmlFor="full-name"><TextInput id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></FormField>
                <FormField label="Professional headline" htmlFor="headline"><TextInput id="headline" value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="Frontend developer and product thinker" /></FormField>
                <FormField label="About" htmlFor="bio"><Textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Share your interests, experience, and goals." /></FormField>
                <FormField label="Skills" htmlFor="skills" description="Separate skills with commas."><Textarea id="skills" value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="React, Python, AWS" /></FormField>
              </div>
            </Card>
          </div>

          <Card>
            <div><p className={workspace.eyebrow}>Links</p><h2 className={workspace.sectionTitle}>Professional presence</h2></div>
            <div className={workspace.formGrid}>
              <FormField label="GitHub URL" htmlFor="github-url"><TextInput id="github-url" type="url" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} placeholder="https://github.com/username" /></FormField>
              <FormField label="LinkedIn URL" htmlFor="linkedin-url"><TextInput id="linkedin-url" type="url" value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} placeholder="https://linkedin.com/in/username" /></FormField>
              <div className={workspace.fullSpan}><FormField label="Portfolio URL" htmlFor="portfolio-url"><TextInput id="portfolio-url" type="url" value={portfolioUrl} onChange={(event) => setPortfolioUrl(event.target.value)} placeholder="https://yourportfolio.com" /></FormField></div>
            </div>
            <div className={workspace.actions}><Button onClick={() => void saveProfile()} disabled={busyAction !== null}>{busyAction === "save" ? "Saving…" : "Save profile"}</Button></div>
          </Card>
        </div>
      )}
    </div>
  );
}
