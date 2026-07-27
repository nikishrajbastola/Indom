"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type VerificationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | null;

export default function PostTaskPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [duration, setDuration] = useState("");

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>(null);
  const [hasVerificationApplication, setHasVerificationApplication] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function checkOrganizationAccess() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login?role=organization");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
          role,
          verification_status,
          organization_type,
          official_email,
          website,
          description,
          contact_person
        `
        )
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setErrorMessage(
          profileError?.message ||
            "We could not load your organization profile."
        );
        setLoading(false);
        return;
      }

      if (profile.role !== "organization") {
        router.replace("/student");
        return;
      }

      setVerificationStatus(
        profile.verification_status as VerificationStatus
      );

      const applicationExists = Boolean(
        profile.organization_type ||
          profile.official_email ||
          profile.website ||
          profile.description ||
          profile.contact_person
      );

      setHasVerificationApplication(applicationExists);
      setLoading(false);
    }

    checkOrganizationAccess();
  }, [router]);

  async function handlePostTask() {
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Enter a task title.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Enter a task description.");
      return;
    }

    if (!skills.trim()) {
      setErrorMessage("Enter at least one required skill.");
      return;
    }

    if (!duration.trim()) {
      setErrorMessage("Enter the expected task duration.");
      return;
    }

    setPosting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login?role=organization");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("verification_status")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setErrorMessage(profileError.message);
        return;
      }

      if (profile?.verification_status !== "approved") {
        setVerificationStatus(
          profile?.verification_status as VerificationStatus
        );
        setErrorMessage(
          "Your organization must be approved before posting tasks."
        );
        return;
      }

      const { error } = await supabase.from("tasks").insert([
        {
          title: title.trim(),
          description: description.trim(),
          skills: skills.trim(),
          duration: duration.trim(),
          organization_id: user.id,
        },
      ]);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      alert("Task posted successfully!");

      setTitle("");
      setDescription("");
      setSkills("");
      setDuration("");
    } catch {
      setErrorMessage(
        "Something went wrong while publishing the task."
      );
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <main style={centeredPage}>
        <section style={accessCard}>
          <div style={spinner} />
          <p style={loadingText}>
            Checking organization verification...
          </p>
        </section>
      </main>
    );
  }

  if (errorMessage && verificationStatus === null) {
    return (
      <main style={centeredPage}>
        <section style={accessCard}>
          <div style={errorIcon}>!</div>

          <p style={errorEyebrow}>PROFILE ERROR</p>

          <h1 style={accessTitle}>
            We could not verify your account.
          </h1>

          <p style={accessDescription}>{errorMessage}</p>

          <Link href="/organization" style={primaryLink}>
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (verificationStatus !== "approved") {
    const isRejected = verificationStatus === "rejected";
    const isPending =
      verificationStatus === "pending" &&
      hasVerificationApplication;

    return (
      <main style={centeredPage}>
        <section style={accessCard}>
          <div
            style={
              isRejected
                ? rejectedIcon
                : isPending
                  ? pendingIcon
                  : lockedIcon
            }
          >
            {isRejected ? "!" : isPending ? "⌛" : "🔒"}
          </div>

          <p
            style={
              isRejected
                ? rejectedEyebrow
                : isPending
                  ? pendingEyebrow
                  : lockedEyebrow
            }
          >
            {isRejected
              ? "APPLICATION REJECTED"
              : isPending
                ? "VERIFICATION PENDING"
                : "VERIFICATION REQUIRED"}
          </p>

          <h1 style={accessTitle}>
            {isRejected
              ? "Update your verification application."
              : isPending
                ? "Your organization is under review."
                : "Verify your organization first."}
          </h1>

          <p style={accessDescription}>
            {isRejected
              ? "Your previous verification request was not approved. Review your organization information and submit an updated application."
              : isPending
                ? "TaskForge is reviewing your organization information. You will be able to publish projects after your application is approved."
                : "Only verified organizations can publish projects and recruit students through TaskForge."}
          </p>

          <div style={buttonRow}>
            <Link href="/organization" style={secondaryLink}>
              Back to dashboard
            </Link>

            <Link
              href="/organization/verification"
              style={primaryLink}
            >
              {isRejected
                ? "Update application"
                : isPending
                  ? "View verification status"
                  : "Start verification"}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={page}>
      <aside style={sidebar}>
        <Link href="/" style={brand}>
          TaskForge
        </Link>

        <nav style={navLinks}>
          <Link href="/organization" style={navItem}>
            Dashboard
          </Link>

          <Link
            href="/organization/tasks"
            style={navItem}
          >
            My Tasks
          </Link>

          <Link
            href="/organization/applicants"
            style={navItem}
          >
            Applicants
          </Link>

          <Link
            href="/organization/analytics"
            style={navItem}
          >
            Analytics
          </Link>

          <Link
            href="/organization/post-task"
            style={activeItem}
          >
            Post Task
          </Link>

          <Link
            href="/organization/profile"
            style={navItem}
          >
            Profile
          </Link>
        </nav>
      </aside>

      <section style={content}>
        <div style={header}>
          <p style={eyebrow}>ORGANIZATION</p>

          <h1 style={titleStyle}>Post a new task.</h1>

          <p style={subtext}>
            Create a clear project students can complete in a
            focused sprint.
          </p>
        </div>

        <div style={verifiedNotice}>
          <span style={verifiedDot} />

          <div>
            <p style={verifiedTitle}>
              Verified organization
            </p>

            <p style={verifiedText}>
              Your organization is approved to publish student
              opportunities.
            </p>
          </div>
        </div>

        <div style={card}>
          {errorMessage && (
            <div style={errorNotice}>{errorMessage}</div>
          )}

          <div style={fieldGroup}>
            <label htmlFor="taskTitle" style={label}>
              Task title
            </label>

            <input
              id="taskTitle"
              style={input}
              placeholder="Example: Clean research survey data"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
            />
          </div>

          <div style={fieldGroup}>
            <label htmlFor="description" style={label}>
              Description
            </label>

            <textarea
              id="description"
              style={textarea}
              placeholder="Describe the work, expected outcome, timeline, and requirements."
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />
          </div>

          <div style={fieldGroup}>
            <label htmlFor="skills" style={label}>
              Skills needed
            </label>

            <input
              id="skills"
              style={input}
              placeholder="Example: Excel, Python, Research"
              value={skills}
              onChange={(event) =>
                setSkills(event.target.value)
              }
            />
          </div>

          <div style={fieldGroup}>
            <label htmlFor="duration" style={label}>
              Duration
            </label>

            <input
              id="duration"
              style={input}
              placeholder="Example: 2 weeks"
              value={duration}
              onChange={(event) =>
                setDuration(event.target.value)
              }
            />
          </div>

          <button
            type="button"
            style={{
              ...button,
              ...(posting ? disabledButton : {}),
            }}
            onClick={handlePostTask}
            disabled={posting}
          >
            {posting ? "Publishing..." : "Publish task"}
          </button>
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
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const centeredPage = {
  minHeight: "100vh",
  background: "#050505",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
};

const navLinks = {
  display: "grid",
  gap: "10px",
  marginTop: "40px",
};

const navItem = {
  color: "#aaa",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: "12px",
};

const activeItem = {
  color: "white",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.08)",
};

const content = {
  padding: "48px",
};

const header = {
  marginBottom: "28px",
};

const eyebrow = {
  color: "#a78bfa",
  fontSize: "14px",
  fontWeight: 700,
  letterSpacing: "0.12em",
};

const titleStyle = {
  fontSize: "48px",
  margin: "8px 0",
  letterSpacing: "-0.04em",
};

const subtext = {
  color: "#aaa",
  fontSize: "18px",
  lineHeight: 1.6,
};

const verifiedNotice = {
  maxWidth: "720px",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "16px 18px",
  marginBottom: "20px",
  borderRadius: "16px",
  background: "rgba(34,197,94,0.08)",
  border: "1px solid rgba(34,197,94,0.2)",
};

const verifiedDot = {
  width: "11px",
  height: "11px",
  borderRadius: "50%",
  background: "#4ade80",
  flexShrink: 0,
};

const verifiedTitle = {
  margin: "0 0 3px",
  color: "#86efac",
  fontWeight: 700,
};

const verifiedText = {
  margin: 0,
  color: "#9ca3af",
  fontSize: "14px",
};

const card = {
  maxWidth: "720px",
  padding: "32px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const fieldGroup = {
  marginBottom: "20px",
};

const label = {
  display: "block",
  marginBottom: "8px",
  color: "#ddd",
  fontWeight: 600,
};

const input = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#111",
  color: "white",
  fontSize: "16px",
  outline: "none",
};

const textarea = {
  ...input,
  height: "180px",
  resize: "vertical" as const,
  lineHeight: 1.6,
};

const button = {
  width: "100%",
  padding: "15px 22px",
  borderRadius: "14px",
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 700,
  fontSize: "16px",
  cursor: "pointer",
};

const disabledButton = {
  opacity: 0.55,
  cursor: "not-allowed",
};

const errorNotice = {
  marginBottom: "22px",
  padding: "14px 16px",
  borderRadius: "13px",
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.24)",
  color: "#fca5a5",
  lineHeight: 1.5,
};

const accessCard = {
  width: "100%",
  maxWidth: "650px",
  padding: "42px",
  borderRadius: "28px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.11)",
  textAlign: "center" as const,
};

const lockedIcon = {
  width: "62px",
  height: "62px",
  margin: "0 auto 18px",
  borderRadius: "50%",
  background: "rgba(168,85,247,0.12)",
  border: "1px solid rgba(168,85,247,0.28)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "25px",
};

const pendingIcon = {
  ...lockedIcon,
  background: "rgba(245,158,11,0.12)",
  border: "1px solid rgba(245,158,11,0.28)",
};

const rejectedIcon = {
  ...lockedIcon,
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.28)",
  color: "#fca5a5",
  fontSize: "28px",
  fontWeight: 800,
};

const errorIcon = {
  ...rejectedIcon,
};

const lockedEyebrow = {
  color: "#c084fc",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.15em",
};

const pendingEyebrow = {
  ...lockedEyebrow,
  color: "#fcd34d",
};

const rejectedEyebrow = {
  ...lockedEyebrow,
  color: "#fca5a5",
};

const errorEyebrow = {
  ...rejectedEyebrow,
};

const accessTitle = {
  fontSize: "40px",
  letterSpacing: "-0.04em",
  margin: "10px 0 16px",
};

const accessDescription = {
  color: "#aaa",
  fontSize: "17px",
  lineHeight: 1.75,
  marginBottom: "28px",
};

const buttonRow = {
  display: "flex",
  gap: "12px",
};

const primaryLink = {
  display: "inline-block",
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "15px 18px",
  borderRadius: "14px",
  background: "white",
  color: "#050505",
  textDecoration: "none",
  fontWeight: 800,
};

const secondaryLink = {
  display: "inline-block",
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "14px 18px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
};

const spinner = {
  width: "34px",
  height: "34px",
  borderWidth: "3px",
  borderStyle: "solid",
  borderColor: "rgba(255,255,255,0.15)",
  borderTopColor: "white",
  borderRadius: "50%",
  margin: "0 auto 18px",
};

const loadingText = {
  color: "#aaa",
  margin: 0,
};