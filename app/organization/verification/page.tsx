"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type VerificationStatus = "pending" | "approved" | "rejected" | null;

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  verification_status: VerificationStatus;
  organization_type: string | null;
  official_email: string | null;
  website: string | null;
  description: string | null;
  contact_person: string | null;
};

export default function OrganizationVerificationPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>(null);

  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [website, setWebsite] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [editingApplication, setEditingApplication] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login?role=organization");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          email,
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

      if (error || !data) {
        setMessage(
          error?.message || "We could not load your organization profile."
        );
        setLoading(false);
        return;
      }

      if (data.role !== "organization") {
        router.replace("/student");
        return;
      }

      const loadedProfile = data as Profile;

      setProfile(loadedProfile);
      setVerificationStatus(loadedProfile.verification_status);

      setOrganizationName(loadedProfile.full_name ?? "");
      setOrganizationType(loadedProfile.organization_type ?? "");
      setWebsite(loadedProfile.website ?? "");
      setContactPerson(loadedProfile.contact_person ?? "");
      setOfficialEmail(
        loadedProfile.official_email ??
          loadedProfile.email ??
          user.email ??
          ""
      );
      setDescription(loadedProfile.description ?? "");

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  function validateStepOne() {
    if (!organizationName.trim()) {
      setMessage("Enter your organization name.");
      return false;
    }

    if (!organizationType) {
      setMessage("Select an organization type.");
      return false;
    }

    if (website.trim()) {
      try {
        new URL(website.trim());
      } catch {
        setMessage(
          "Enter a complete website address, such as https://example.com."
        );
        return false;
      }
    }

    setMessage("");
    return true;
  }

  function goToStepTwo() {
    if (validateStepOne()) {
      setStep(2);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!contactPerson.trim()) {
      setMessage("Enter the name of the organization contact person.");
      return;
    }

    if (!officialEmail.trim()) {
      setMessage("Enter an official organization email.");
      return;
    }

    if (description.trim().length < 40) {
      setMessage(
        "Please provide an organization description of at least 40 characters."
      );
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login?role=organization");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: organizationName.trim(),
          organization_type: organizationType,
          official_email: officialEmail.trim().toLowerCase(),
          website: website.trim() || null,
          description: description.trim(),
          contact_person: contactPerson.trim(),
          verification_status: "pending",
          reviewed_at: null,
          reviewed_by: null,
        })
        .eq("id", user.id);

      if (error) {
        setMessage(error.message);
        return;
      }

      setVerificationStatus("pending");
      setEditingApplication(false);
      setMessage("");
    } catch {
      setMessage("Something went wrong while submitting your application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main style={centeredPage}>
        <div style={statusCard}>
          <div style={spinner} />
          <p style={mutedText}>Loading organization details...</p>
        </div>
      </main>
    );
  }

  if (verificationStatus === "approved" && !editingApplication) {
    return (
      <main style={centeredPage}>
        <section style={statusCard}>
          <div style={approvedIcon}>✓</div>

          <p style={approvedEyebrow}>VERIFIED ORGANIZATION</p>

          <h1 style={statusTitle}>Your organization is approved.</h1>

          <p style={statusDescription}>
            Your organization can now post projects, review applicants, and
            manage student collaborations.
          </p>

          <Link href="/organization" style={primaryLink}>
            Go to organization dashboard
          </Link>
        </section>
      </main>
    );
  }

  const hasSubmittedApplication =
    verificationStatus === "pending" &&
    Boolean(
      profile?.organization_type ||
        organizationType ||
        profile?.contact_person ||
        contactPerson ||
        profile?.description ||
        description
    );

  if (
    hasSubmittedApplication &&
    !editingApplication &&
    verificationStatus === "pending"
  ) {
    return (
      <main style={centeredPage}>
        <section style={statusCard}>
          <div style={pendingIcon}>⌛</div>

          <p style={pendingEyebrow}>PENDING REVIEW</p>

          <h1 style={statusTitle}>Your application is under review.</h1>

          <p style={statusDescription}>
            TaskForge is reviewing your organization information. You cannot
            post projects until the application is approved.
          </p>

          <div style={statusInformation}>
            <div>
              <p style={informationLabel}>Organization</p>
              <p style={informationValue}>{organizationName}</p>
            </div>

            <div>
              <p style={informationLabel}>Contact email</p>
              <p style={informationValue}>{officialEmail}</p>
            </div>

            <div>
              <p style={informationLabel}>Current status</p>
              <p style={pendingStatusText}>Pending verification</p>
            </div>
          </div>

          <div style={buttonRow}>
            <Link href="/organization" style={secondaryLink}>
              Back to dashboard
            </Link>

            <button
              type="button"
              onClick={() => {
                setEditingApplication(true);
                setStep(1);
              }}
              style={secondaryButton}
            >
              Update application
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={backgroundGlowOne} />
      <div style={backgroundGlowTwo} />

      <section style={container}>
        <div style={header}>
          <Link href="/" style={brand}>
            TaskForge
          </Link>

          <Link href="/organization" style={dashboardLink}>
            Back to dashboard
          </Link>
        </div>

        <div style={contentGrid}>
          <section style={introPanel}>
            <p style={eyebrow}>ORGANIZATION VERIFICATION</p>

            <h1 style={title}>Apply to publish opportunities.</h1>

            <p style={subtitle}>
              TaskForge reviews every organization before allowing it to post
              projects. This protects students from misleading or fraudulent
              opportunities.
            </p>

            <div style={trustBox}>
              <p style={trustTitle}>Why verification matters</p>

              <div style={trustItem}>
                <span style={checkIcon}>✓</span>
                <span>Students know opportunities come from real groups.</span>
              </div>

              <div style={trustItem}>
                <span style={checkIcon}>✓</span>
                <span>Fake company and organization profiles are prevented.</span>
              </div>

              <div style={trustItem}>
                <span style={checkIcon}>✓</span>
                <span>Only approved organizations can publish projects.</span>
              </div>
            </div>
          </section>

          <section style={formPanel}>
            <div style={stepHeader}>
              <div>
                <p style={stepLabel}>STEP {step} OF 2</p>
                <h2 style={formTitle}>
                  {step === 1
                    ? "Organization information"
                    : "Contact and verification details"}
                </h2>
              </div>

              <div style={stepIndicators}>
                <span
                  style={{
                    ...stepCircle,
                    ...(step >= 1 ? activeStepCircle : {}),
                  }}
                >
                  1
                </span>

                <span
                  style={{
                    ...stepLine,
                    ...(step === 2 ? activeStepLine : {}),
                  }}
                />

                <span
                  style={{
                    ...stepCircle,
                    ...(step === 2 ? activeStepCircle : {}),
                  }}
                >
                  2
                </span>
              </div>
            </div>

            {verificationStatus === "rejected" && (
              <div style={rejectedNotice}>
                Your previous application was not approved. Review your
                information and submit a new request.
              </div>
            )}

            {message && <div style={errorNotice}>{message}</div>}

            {step === 1 ? (
              <div style={form}>
                <div style={fieldGroup}>
                  <label htmlFor="organizationName" style={label}>
                    Organization name
                  </label>

                  <input
                    id="organizationName"
                    type="text"
                    value={organizationName}
                    onChange={(event) =>
                      setOrganizationName(event.target.value)
                    }
                    placeholder="Texas State AI Research Lab"
                    style={input}
                  />
                </div>

                <div style={fieldGroup}>
                  <label htmlFor="organizationType" style={label}>
                    Organization type
                  </label>

                  <select
                    id="organizationType"
                    value={organizationType}
                    onChange={(event) =>
                      setOrganizationType(event.target.value)
                    }
                    style={input}
                  >
                    <option value="">Select organization type</option>
                    <option value="startup">Startup</option>
                    <option value="company">Company</option>
                    <option value="research_lab">Research lab</option>
                    <option value="student_organization">
                      Student organization
                    </option>
                    <option value="nonprofit">Nonprofit</option>
                    <option value="university_department">
                      University department
                    </option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={fieldGroup}>
                  <label htmlFor="website" style={label}>
                    Organization website
                    <span style={optionalText}> Optional</span>
                  </label>

                  <input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    placeholder="https://organization.org"
                    style={input}
                  />

                  <p style={helperText}>
                    Campus organizations without a website may leave this blank.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goToStepTwo}
                  style={primaryButton}
                >
                  Continue
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={form}>
                <div style={fieldGroup}>
                  <label htmlFor="contactPerson" style={label}>
                    Contact person
                  </label>

                  <input
                    id="contactPerson"
                    type="text"
                    value={contactPerson}
                    onChange={(event) =>
                      setContactPerson(event.target.value)
                    }
                    placeholder="Full name"
                    style={input}
                    required
                  />
                </div>

                <div style={fieldGroup}>
                  <label htmlFor="officialEmail" style={label}>
                    Official organization email
                  </label>

                  <input
                    id="officialEmail"
                    type="email"
                    value={officialEmail}
                    onChange={(event) =>
                      setOfficialEmail(event.target.value)
                    }
                    placeholder="contact@organization.org"
                    style={input}
                    required
                  />

                  <p style={helperText}>
                    Use a company, university, lab, nonprofit, or organization
                    email when available.
                  </p>
                </div>

                <div style={fieldGroup}>
                  <label htmlFor="description" style={label}>
                    Organization description
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Describe what your organization does and the types of student projects you plan to offer."
                    rows={7}
                    minLength={40}
                    style={textarea}
                    required
                  />

                  <p style={helperText}>
                    Minimum 40 characters. Current length: {description.length}
                  </p>
                </div>

                <div style={buttonRow}>
                  <button
                    type="button"
                    onClick={() => {
                      setMessage("");
                      setStep(1);
                    }}
                    style={secondaryButton}
                    disabled={submitting}
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    style={{
                      ...primaryButton,
                      ...(submitting ? disabledButton : {}),
                    }}
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit verification request"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

const page = {
  minHeight: "100vh",
  background: "#050505",
  color: "white",
  position: "relative" as const,
  overflow: "hidden",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const centeredPage = {
  minHeight: "100vh",
  background: "#050505",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const backgroundGlowOne = {
  position: "absolute" as const,
  width: "520px",
  height: "520px",
  borderRadius: "50%",
  background: "rgba(126, 34, 206, 0.18)",
  filter: "blur(120px)",
  top: "-220px",
  right: "-100px",
  pointerEvents: "none" as const,
};

const backgroundGlowTwo = {
  position: "absolute" as const,
  width: "420px",
  height: "420px",
  borderRadius: "50%",
  background: "rgba(37, 99, 235, 0.12)",
  filter: "blur(120px)",
  bottom: "-180px",
  left: "-100px",
  pointerEvents: "none" as const,
};

const container = {
  position: "relative" as const,
  zIndex: 1,
  maxWidth: "1240px",
  margin: "0 auto",
  padding: "28px 32px 64px",
};

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "56px",
};

const brand = {
  color: "white",
  textDecoration: "none",
  fontSize: "22px",
  fontWeight: 800,
};

const dashboardLink = {
  color: "#c7c7c7",
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.14)",
  padding: "10px 16px",
  borderRadius: "12px",
};

const contentGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 0.85fr) minmax(460px, 1.15fr)",
  gap: "56px",
  alignItems: "start",
};

const introPanel = {
  paddingTop: "32px",
};

const eyebrow = {
  color: "#c084fc",
  fontSize: "13px",
  fontWeight: 800,
  letterSpacing: "0.16em",
};

const title = {
  fontSize: "58px",
  lineHeight: 1.02,
  letterSpacing: "-0.055em",
  margin: "14px 0 22px",
};

const subtitle = {
  color: "#aaa",
  fontSize: "18px",
  lineHeight: 1.75,
  maxWidth: "540px",
};

const trustBox = {
  marginTop: "36px",
  padding: "24px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: "16px",
};

const trustTitle = {
  margin: 0,
  fontWeight: 700,
  fontSize: "17px",
};

const trustItem = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  color: "#b7b7b7",
  lineHeight: 1.55,
};

const checkIcon = {
  color: "#c084fc",
  fontWeight: 900,
};

const formPanel = {
  padding: "32px",
  borderRadius: "28px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.11)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
  backdropFilter: "blur(18px)",
};

const stepHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "24px",
  marginBottom: "28px",
};

const stepLabel = {
  color: "#c084fc",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.14em",
  margin: "0 0 8px",
};

const formTitle = {
  fontSize: "25px",
  margin: 0,
};

const stepIndicators = {
  display: "flex",
  alignItems: "center",
  paddingTop: "4px",
};

const stepCircle = {
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#777",
  fontSize: "13px",
  fontWeight: 800,
};

const activeStepCircle = {
  background: "#fff",
  color: "#050505",
  borderColor: "#fff",
};

const stepLine = {
  width: "32px",
  height: "1px",
  background: "rgba(255,255,255,0.16)",
};

const activeStepLine = {
  background: "#fff",
};

const form = {
  display: "grid",
  gap: "22px",
};

const fieldGroup = {
  display: "grid",
  gap: "9px",
};

const label = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#e7e7e7",
};

const optionalText = {
  color: "#777",
  fontWeight: 500,
};

const input = {
  width: "100%",
  boxSizing: "border-box" as const,
  background: "rgba(0,0,0,0.32)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.13)",
  borderRadius: "14px",
  padding: "14px 15px",
  fontSize: "15px",
  outline: "none",
};

const textarea = {
  ...input,
  resize: "vertical" as const,
  minHeight: "150px",
  lineHeight: 1.6,
};

const helperText = {
  margin: 0,
  color: "#777",
  fontSize: "12px",
  lineHeight: 1.5,
};

const primaryButton = {
  width: "100%",
  border: "none",
  borderRadius: "14px",
  padding: "15px 18px",
  background: "white",
  color: "#050505",
  fontSize: "15px",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButton = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "14px",
  padding: "14px 18px",
  background: "transparent",
  color: "white",
  fontSize: "15px",
  fontWeight: 700,
  cursor: "pointer",
};

const disabledButton = {
  opacity: 0.55,
  cursor: "not-allowed",
};

const buttonRow = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
};

const errorNotice = {
  marginBottom: "20px",
  padding: "14px 16px",
  borderRadius: "13px",
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.24)",
  color: "#fca5a5",
  fontSize: "14px",
  lineHeight: 1.5,
};

const rejectedNotice = {
  marginBottom: "20px",
  padding: "14px 16px",
  borderRadius: "13px",
  background: "rgba(245,158,11,0.1)",
  border: "1px solid rgba(245,158,11,0.24)",
  color: "#fcd34d",
  fontSize: "14px",
  lineHeight: 1.5,
};

const statusCard = {
  width: "100%",
  maxWidth: "640px",
  padding: "42px",
  borderRadius: "28px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.11)",
  textAlign: "center" as const,
};

const approvedIcon = {
  width: "58px",
  height: "58px",
  margin: "0 auto 18px",
  borderRadius: "50%",
  background: "rgba(34,197,94,0.14)",
  border: "1px solid rgba(34,197,94,0.3)",
  color: "#86efac",
  fontSize: "27px",
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const pendingIcon = {
  width: "58px",
  height: "58px",
  margin: "0 auto 18px",
  borderRadius: "50%",
  background: "rgba(245,158,11,0.14)",
  border: "1px solid rgba(245,158,11,0.3)",
  fontSize: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const approvedEyebrow = {
  color: "#86efac",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.14em",
};

const pendingEyebrow = {
  color: "#fcd34d",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.14em",
};

const statusTitle = {
  fontSize: "38px",
  letterSpacing: "-0.04em",
  margin: "10px 0 16px",
};

const statusDescription = {
  color: "#aaa",
  fontSize: "17px",
  lineHeight: 1.7,
  marginBottom: "28px",
};

const statusInformation = {
  textAlign: "left" as const,
  display: "grid",
  gap: "16px",
  padding: "20px",
  borderRadius: "18px",
  background: "rgba(0,0,0,0.26)",
  marginBottom: "24px",
};

const informationLabel = {
  margin: "0 0 4px",
  color: "#777",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

const informationValue = {
  margin: 0,
  color: "#e5e5e5",
  fontWeight: 600,
};

const pendingStatusText = {
  margin: 0,
  color: "#fcd34d",
  fontWeight: 700,
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
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "14px 18px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
};

const mutedText = {
  color: "#aaa",
};

const spinner = {
  width: "34px",
  height: "34px",
  border: "3px solid rgba(255,255,255,0.15)",
  borderTopColor: "white",
  borderRadius: "50%",
  margin: "0 auto 18px",
};