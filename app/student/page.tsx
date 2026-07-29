import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function StudentOverview() {
  return (
    <main style={page}>
      <aside style={sidebar}>
        <h2 style={brand}>Indom</h2>

        <nav style={nav}>
          <Link href="/student" style={activeNav}>
            Overview
          </Link>

          <Link href="/student/projects" style={navItem}>
            Browse Projects
          </Link>

          <Link href="/student/applications" style={navItem}>
            My Applications
          </Link>

          <Link href="/student/profile" style={navItem}>
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
        <p style={eyebrow}>STUDENT DASHBOARD</p>

        <h1 style={title}>Build proof through real work.</h1>

        <p style={subtitle}>
          Track projects, applications, and your profile from one place.
        </p>

        <div style={grid}>
          <Link href="/student/projects" style={card}>
            <h2>Browse Projects</h2>
            <p>Find real tasks posted by organizations.</p>
          </Link>

          <Link href="/student/applications" style={card}>
            <h2>My Applications</h2>
            <p>Track the projects you applied to.</p>
          </Link>

          <Link href="/student/profile" style={card}>
            <h2>Profile</h2>
            <p>Manage your resume and project proof.</p>
          </Link>
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

const sidebar = {
  minHeight: "100vh",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  padding: "28px",
  background: "#080808",

  display: "flex",
  flexDirection: "column" as const,
};

const brand = {
  fontSize: "22px",
  marginBottom: "40px",
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
  color: "#60a5fa",
  fontSize: "13px",
  fontWeight: 800,
  letterSpacing: "0.16em",
};

const title = {
  fontSize: "56px",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "20px",
};

const card = {
  padding: "28px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  textDecoration: "none",
};