"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        full_name,
        headline,
        bio,
        avatar_url,
        github_url,
        linkedin_url,
        portfolio_url,
        skills,
        resume_url
      `)
      .eq("id", user.id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
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
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      alert("Please choose a profile photo first.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const filePath = `${user.id}/${Date.now()}-${avatarFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    setAvatarUrl(publicUrl);
    alert("Profile photo uploaded!");
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      alert("Please choose a resume first.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const filePath = `${user.id}/${Date.now()}-${resumeFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, resumeFile);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("resumes").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ resume_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    setResumeUrl(publicUrl);
    alert("Resume uploaded successfully!");
  };

  const saveProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        headline,
        bio,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        skills,
      })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile updated!");
  };

  return (
    <main style={page}>
      <aside style={sidebar}>
        <Link href="/" style={brand}>Indom</Link>

        <nav style={nav}>
          <Link href="/student" style={navItem}>Overview</Link>
          <Link href="/student/projects" style={navItem}>Browse Projects</Link>
          <Link href="/student/applications" style={navItem}>My Applications</Link>
          <Link href="/student/profile" style={activeNav}>Profile</Link>
        </nav>
      </aside>

      <section style={content}>
        <p style={eyebrow}>STUDENT PROFILE</p>
        <h1 style={title}>Your professional profile.</h1>
        <p style={subtitle}>Build a profile organizations can trust.</p>

        <div style={heroCard}>
          <div style={avatarSection}>
            <div style={avatar}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" style={avatarImage} />
              ) : (
                fullName.charAt(0) || "U"
              )}
            </div>

            <div>
              <h2 style={profileName}>{fullName || "Your Name"}</h2>
              <p style={profileHeadline}>
                {headline || "Add a professional headline"}
              </p>
            </div>
          </div>

          <p style={profileBio}>
            {bio || "Write a short bio about your skills, interests, and goals."}
          </p>

          <input
            type="file"
            accept="image/*"
            style={fileInput}
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />

          <button style={button} onClick={handleAvatarUpload}>
            Upload Profile Photo
          </button>
        </div>

        <div style={grid}>
          <div style={card}>
            <h2 style={cardTitle}>Resume</h2>

            <p style={description}>
              Upload your resume so organizations can review your experience.
            </p>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              style={fileInput}
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />

            <button style={button} onClick={handleResumeUpload}>
              Upload Resume
            </button>

            {resumeUrl && (
              <a href={resumeUrl} target="_blank" style={resumeLink}>
                View Uploaded Resume
              </a>
            )}
          </div>

          <div style={card}>
            <h2 style={cardTitle}>Profile Information</h2>

            <input
              style={input}
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              style={input}
              placeholder="Professional headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />

            <textarea
              style={textarea}
              placeholder="Short professional bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <input
              style={input}
              placeholder="GitHub URL"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />

            <input
              style={input}
              placeholder="LinkedIn URL"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />

            <input
              style={input}
              placeholder="Portfolio URL"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />

            <textarea
              style={textarea}
              placeholder="Skills (React, Python, AWS...)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />

            <button style={button} onClick={saveProfile}>
              Save Profile
            </button>
          </div>
        </div>
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

const nav = { display: "grid", gap: "10px" };

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

const content = { padding: "48px" };

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

const heroCard = {
  padding: "32px",
  borderRadius: "28px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  marginBottom: "24px",
};

const avatarSection = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  marginBottom: "20px",
};

const avatar = {
  width: "90px",
  height: "90px",
  borderRadius: "50%",
  background: "#27272a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "32px",
  fontWeight: 700,
  overflow: "hidden",
};

const avatarImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
};

const profileName = {
  fontSize: "32px",
  marginBottom: "6px",
};

const profileHeadline = {
  color: "#aaa",
  fontSize: "16px",
};

const profileBio = {
  color: "#b5b5b5",
  lineHeight: "1.6",
  marginBottom: "20px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: "20px",
};

const card = {
  padding: "28px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const cardTitle = {
  fontSize: "24px",
  marginBottom: "12px",
};

const description = {
  color: "#b5b5b5",
  lineHeight: "1.6",
  marginBottom: "20px",
};

const fileInput = {
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#111",
  color: "white",
  marginBottom: "16px",
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#111",
  color: "white",
  marginBottom: "14px",
};

const textarea = {
  width: "100%",
  minHeight: "110px",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#111",
  color: "white",
  marginBottom: "18px",
};

const button = {
  width: "100%",
  padding: "14px",
  borderRadius: "999px",
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 700,
  cursor: "pointer",
};

const resumeLink = {
  display: "block",
  marginTop: "16px",
  color: "#60a5fa",
  textDecoration: "none",
  fontWeight: 700,
};