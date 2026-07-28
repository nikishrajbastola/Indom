import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function OrganizationOverviewPage() {
  return (
    <main style={page}>
      <aside style={sidebar}>
        <Link href="/" style={brand}>
          TaskForge
        </Link>

        <nav style={nav}>
          <Link href="/organization" style={activeNav}>
            Overview
          </Link>

          <Link href="/organization/tasks" style={navItem}>
            My Tasks
          </Link>

          <Link href="/organization/applicants" style={navItem}>
            Applicants
          </Link>

          <Link href="/organization/analytics" style={navItem}>
            Analytics
          </Link>

          <Link href="/organization/post-task" style={navItem}>
            Post Task
          </Link>

          <Link href="/organization/profile" style={navItem}>
            Profile
          </Link>
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "30px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <LogoutButton />
        </div>
      </aside>

      <section style={content}>
        <p style={eyebrow}>ORGANIZATION DASHBOARD</p>

        <h1 style={title}>
          Manage your organization workflow.
        </h1>

        <p style={subtitle}>
          Post projects, review applicants, analyze engagement, and manage
          student collaboration.
        </p>

        <section style={grid}>
          <Link href="/organization/tasks" style={card}>
            <h2 style={cardTitle}>My Tasks</h2>

            <p style={cardText}>
              View and manage all projects posted by your organization.
            </p>
          </Link>

          <Link href="/organization/applicants" style={card}>
            <h2 style={cardTitle}>Applicants</h2>

            <p style={cardText}>
              Review students who applied to your projects.
            </p>
          </Link>

          <Link href="/organization/analytics" style={card}>
            <h2 style={cardTitle}>Analytics</h2>

            <p style={cardText}>
              Track applications, acceptance rate, and project engagement KPIs.
            </p>
          </Link>

          <Link href="/organization/post-task" style={card}>
            <h2 style={cardTitle}>Post a Task</h2>

            <p style={cardText}>
              Create a new project and start receiving applications.
            </p>
          </Link>

          <Link href="/organization/profile" style={card}>
            <h2 style={cardTitle}>Organization Profile</h2>

            <p style={cardText}>
              Manage your organization identity, website, and company information.
            </p>
          </Link>
        </section>
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

const sidebar = {
  minHeight: "100vh",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  padding: "28px",
  background: "#080808",

  display: "flex",
  flexDirection: "column" as const,
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

const content = {
  padding: "56px",
};

const eyebrow = {
  color: "#c084fc",
  fontSize: "13px",
  fontWeight: 800,
  letterSpacing: "0.16em",
};

const title = {
  fontSize: "58px",
  margin: "10px 0",
  letterSpacing: "-0.05em",
};

const subtitle = {
  color: "#aaa",
  fontSize: "18px",
  marginBottom: "36px",
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
};

const card = {
  padding: "28px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  textDecoration: "none",
  color: "white",
};

const cardTitle = {
  fontSize: "26px",
  marginBottom: "12px",
};

const cardText = {
  color: "#b5b5b5",
  lineHeight: "1.6",
};