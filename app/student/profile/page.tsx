/* eslint-disable @next/next/no-img-element */
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import styles from "@/components/product/Product.module.css";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/EmptyState";
import formStyles from "@/components/ui/FormControls.module.css";
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
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in to manage your profile.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("profiles")
      .select("full_name, headline, bio, avatar_url, github_url, linkedin_url, portfolio_url, skills, resume_url")
      .eq("id", user.id)
      .single();

    if (queryError) {
      setError("We couldn’t load your profile. Please try again.");
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
    const initialLoad = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadProfile]);

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setError("Choose a profile photo before uploading.");
      return;
    }

    setError("");
    setSuccess("");
    setUploadingAvatar(true);
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in before uploading a profile photo.");
      setUploadingAvatar(false);
      return;
    }

    const filePath = `${user.id}/${Date.now()}-${avatarFile.name}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile);

    if (uploadError) {
      setError("We couldn’t upload your profile photo.");
      setUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);

    if (updateError) {
      setError("Your photo uploaded, but we couldn’t add it to your profile.");
      setUploadingAvatar(false);
      return;
    }

    setAvatarUrl(publicUrl);
    setSuccess("Profile photo updated.");
    setUploadingAvatar(false);
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setError("Choose a resume before uploading.");
      return;
    }

    setError("");
    setSuccess("");
    setUploadingResume(true);
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in before uploading a resume.");
      setUploadingResume(false);
      return;
    }

    const filePath = `${user.id}/${Date.now()}-${resumeFile.name}`;
    const { error: uploadError } = await supabase.storage.from("resumes").upload(filePath, resumeFile);

    if (uploadError) {
      setError("We couldn’t upload your resume.");
      setUploadingResume(false);
      return;
    }

    const { data } = supabase.storage.from("resumes").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    const { error: updateError } = await supabase.from("profiles").update({ resume_url: publicUrl }).eq("id", user.id);

    if (updateError) {
      setError("Your resume uploaded, but we couldn’t add it to your profile.");
      setUploadingResume(false);
      return;
    }

    setResumeUrl(publicUrl);
    setSuccess("Resume uploaded successfully.");
    setUploadingResume(false);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in before saving your profile.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName, headline, bio, github_url: githubUrl, linkedin_url: linkedinUrl, portfolio_url: portfolioUrl, skills })
      .eq("id", user.id);

    if (updateError) {
      setError("We couldn’t save your profile. Please try again.");
    } else {
      setSuccess("Profile updated successfully.");
    }

    setSaving(false);
  };

  return (
    <div className={`${styles.page} ${styles.pageMedium}`}>
      <PageHeader
        eyebrow="Student profile"
        title="Your professional profile"
        description="Keep the information organizations use to understand your skills, interests, and experience current."
      />

      {error && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p>}
      {success && <p className={`${styles.notice} ${styles.noticeSuccess}`} role="status">{success}</p>}

      {loading ? (
        <LoadingState label="Loading your profile" />
      ) : (
        <div className={styles.splitGrid}>
          <div className={styles.applicationList}>
            <section className={styles.previewPanel} aria-labelledby="profile-preview-title">
              <div className={styles.profileHero}>
                <div className={styles.avatar}>
                  {avatarUrl ? <img src={avatarUrl} alt={`${fullName || "Student"} profile`} /> : fullName.charAt(0).toUpperCase() || "S"}
                </div>
                <div>
                  <h2 id="profile-preview-title">{fullName || "Your name"}</h2>
                  <p>{headline || "Add a professional headline"}</p>
                </div>
              </div>
              <p className={styles.profileBody}>{bio || "Add a short bio about your skills, interests, and the work you want to explore."}</p>
              <div className={styles.chips}>
                {(skills || "Add your skills").split(/[,;]/).map((skill) => skill.trim()).filter(Boolean).slice(0, 6).map((skill) => <span key={skill} className={styles.chip}>{skill}</span>)}
              </div>
              <div className={styles.profileLinks}>
                {githubUrl && <a href={githubUrl} target="_blank" rel="noreferrer">GitHub</a>}
                {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
                {portfolioUrl && <a href={portfolioUrl} target="_blank" rel="noreferrer">Portfolio</a>}
              </div>
            </section>

            <section className={styles.panel} aria-labelledby="profile-assets-title">
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Files</p>
                  <h2 id="profile-assets-title">Photo and resume</h2>
                </div>
              </div>

              <div className={formStyles.form}>
                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="avatar-upload">Profile photo</label>
                  <input id="avatar-upload" className={formStyles.fileInput} type="file" accept="image/*" onChange={(event) => setAvatarFile(event.target.files?.[0] || null)} />
                  <Button variant="secondary" size="small" onClick={handleAvatarUpload} loading={uploadingAvatar}>
                    {uploadingAvatar ? "Uploading…" : "Upload photo"}
                  </Button>
                </div>

                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="resume-upload">Resume</label>
                  <input id="resume-upload" className={formStyles.fileInput} type="file" accept=".pdf,.doc,.docx" onChange={(event) => setResumeFile(event.target.files?.[0] || null)} />
                  <p className={formStyles.help}>PDF, DOC, or DOCX.</p>
                  <Button variant="secondary" size="small" onClick={handleResumeUpload} loading={uploadingResume}>
                    {uploadingResume ? "Uploading…" : "Upload resume"}
                  </Button>
                  {resumeUrl && <a className={styles.textLink} href={resumeUrl} target="_blank" rel="noreferrer">View current resume →</a>}
                </div>
              </div>
            </section>
          </div>

          <form className={styles.formPanel} onSubmit={saveProfile}>
            <section className={styles.subsection} aria-labelledby="professional-info-title">
              <h2 id="professional-info-title">Professional information</h2>
              <p>Introduce yourself clearly and concisely.</p>
              <div className={formStyles.form}>
                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="full-name">Full name</label>
                  <input id="full-name" className={formStyles.input} value={fullName} onChange={(event) => setFullName(event.target.value)} />
                </div>
                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="headline">Professional headline</label>
                  <input id="headline" className={formStyles.input} placeholder="Example: Computer science student focused on data" value={headline} onChange={(event) => setHeadline(event.target.value)} />
                </div>
                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="bio">About</label>
                  <textarea id="bio" className={formStyles.textarea} placeholder="Share your interests, experience, and the work you want to explore." value={bio} onChange={(event) => setBio(event.target.value)} />
                </div>
                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="skills">Skills</label>
                  <textarea id="skills" className={formStyles.textarea} placeholder="React, Python, research, project management" value={skills} onChange={(event) => setSkills(event.target.value)} />
                  <p className={formStyles.help}>Separate skills with commas.</p>
                </div>
              </div>
            </section>

            <section className={styles.subsection} aria-labelledby="profile-links-title">
              <h2 id="profile-links-title">Professional links</h2>
              <p>Add the places where organizations can review your work.</p>
              <div className={formStyles.form}>
                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="github-url">GitHub URL</label>
                  <input id="github-url" className={formStyles.input} type="url" placeholder="https://github.com/you" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} />
                </div>
                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="linkedin-url">LinkedIn URL</label>
                  <input id="linkedin-url" className={formStyles.input} type="url" placeholder="https://linkedin.com/in/you" value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} />
                </div>
                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="portfolio-url">Portfolio URL</label>
                  <input id="portfolio-url" className={formStyles.input} type="url" placeholder="https://yourportfolio.com" value={portfolioUrl} onChange={(event) => setPortfolioUrl(event.target.value)} />
                </div>
              </div>
            </section>

            <div className={formStyles.actions}>
              <Button type="submit" loading={saving}>{saving ? "Saving…" : "Save profile"}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
