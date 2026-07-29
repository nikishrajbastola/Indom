"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function OrganizationProfilePage() {
  const [organizationName, setOrganizationName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, website_url, industry, organization_description")
      .eq("id", user.id)
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setOrganizationName(data?.full_name || "");
    setWebsiteUrl(data?.website_url || "");
    setIndustry(data?.industry || "");
    setDescription(data?.organization_description || "");
    setLoading(false);
  };

  const saveProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: organizationName,
        website_url: websiteUrl,
        industry,
        organization_description: description,
      })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Organization profile updated!");
  };

  return (
    <main style={page}>
      <aside style={sidebar}>
        <Link href="/" style={brand}>
          Indom
        </Link>

        <nav style={nav}>
          <Link href="/organization" style={navItem}>
            Overview
          </Link>
          <Link href="/organization/tasks" style={navItem}>
            My Tasks
          </Link>
          <Link href="/organization/applicants" style={navItem}>
            Applicants
          </Link>
          <Link href="/organization/post-task" style={navItem}>
            Post Task
          </Link>
          <Link href="/organization/profile" style={activeNav}>
            Profile
          </Link>
        </nav>
      </aside>

      <section style={content}>
        <header style={header}>
          <div>
            <p style={eyebrow}>ORGANIZATION PROFILE</p>
            <h1 style={title}>Company identity</h1>
            <p style={subtitle}>
              Help students understand who is posting projects.
            </p>
          </div>
        </header>

        {loading ? (
          <div style={emptyState}>Loading profile...</div>
        ) : (
          <section style={panel}>
            <div style={previewCard}>
              <p style={previewLabel}>Preview</p>
              <h2 style={companyName}>
                {organizationName || "Organization name"}
              </h2>
              <p style={companyIndustry}>
                {industry || "Industry / focus area"}
              </p>
              <p style={companyDescription}>
                {description ||
                  "Write a short description so students know what your organization does."}
              </p>

              {websiteUrl && (
                <a href={websiteUrl} target="_blank" style={websiteLink}>
                  Visit website
                </a>
              )}
            </div>

            <div style={formCard}>
              <label style={label}>Organization name</label>
              <input
                style={input}
                placeholder="Example: Texas State AI Club"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />

              <label style={label}>Website</label>
              <input
                style={input}
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />

              <label style={label}>Industry / focus</label>
              <input
                style={input}
                placeholder="Education, AI, nonprofit, startup..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />

              <label style={label}>Description</label>
              <textarea
                style={textarea}
                placeholder="Describe your organization and the kind of projects you post."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <button style={button} onClick={saveProfile}>
                Save profile
              </button>
            </div>
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

const panel = {
  display: "grid",
  gridTemplateColumns: "0.9fr 1.1fr",
  gap: "20px",
};

const previewCard = {
  padding: "28px",
  borderRadius: "18px",
  background: "#0d0d0d",
  border: "1px solid rgba(255,255,255,0.08)",
  height: "fit-content",
};

const previewLabel = {
  color: "#71717a",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  marginBottom: "18px",
};

const companyName = {
  fontSize: "28px",
  marginBottom: "8px",
};

const companyIndustry = {
  color: "#a1a1aa",
  fontSize: "14px",
  marginBottom: "18px",
};

const companyDescription = {
  color: "#8f8f8f",
  lineHeight: "1.7",
  marginBottom: "20px",
};

const websiteLink = {
  color: "#d4d4d8",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "14px",
};

const formCard = {
  padding: "28px",
  borderRadius: "18px",
  background: "#0d0d0d",
  border: "1px solid rgba(255,255,255,0.08)",
};

const label = {
  display: "block",
  color: "#d4d4d8",
  fontSize: "13px",
  fontWeight: 700,
  marginBottom: "8px",
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#111",
  color: "white",
  marginBottom: "18px",
};

const textarea = {
  width: "100%",
  minHeight: "150px",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#111",
  color: "white",
  marginBottom: "18px",
};

const button = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "white",
  color: "black",
  fontWeight: 800,
  cursor: "pointer",
};

const emptyState = {
  padding: "28px",
  borderRadius: "18px",
  background: "#0d0d0d",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#8f8f8f",
};