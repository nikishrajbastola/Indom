import Link from "next/link";

export default function Home() {
  return (
    <main style={page}>
      {/* navbar */}
      <nav style={nav}>
        <div style={logo}>Indom</div>

        <div style={navRight}>
          <Link href="/login" style={navLink}>
            Log in
          </Link>
        </div>
      </nav>

      {/* glow background */}
      <div style={blueGlow}></div>
      <div style={purpleGlow}></div>

      {/* hero */}
      <section style={hero}>
        <p style={tag}>THE FUTURE OF STUDENT WORK</p>

        <h1 style={title}>
          Build your career
          <br />
          before graduation.
        </h1>

        <p style={subtitle}>
          Students gain real experience.
          <br />
          Organizations get real execution.
        </p>

        <div style={buttonContainer}>
          <Link href="/auth/student" style={primaryBtn}>
            Join as Student
          </Link>

          <Link href="/auth/organization" style={secondaryBtn}>
            Hire Student Teams
          </Link>
        </div>
      </section>
    </main>
  );
}

const page = {
  minHeight: "100vh",
  background: "#000",
  color: "white",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  overflow: "hidden",
  position: "relative" as const,
};

const nav = {
  height: "80px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 60px",
  position: "relative" as const,
  zIndex: 2,
};

const logo = {
  fontSize: "22px",
  fontWeight: 700,
  letterSpacing: "-0.04em",
};

const navRight = {
  display: "flex",
  gap: "20px",
};

const navLink = {
  textDecoration: "none",
  color: "#d4d4d8",
  fontSize: "15px",
};

const hero = {
  minHeight: "calc(100vh - 80px)",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center" as const,
  position: "relative" as const,
  zIndex: 2,
  padding: "0 20px",
};

const tag = {
  color: "#71717a",
  fontSize: "14px",
  letterSpacing: "0.2em",
  marginBottom: "24px",
};

const title = {
  fontSize: "110px",
  fontWeight: 800,
  lineHeight: "0.95",
  letterSpacing: "-0.08em",
  margin: 0,
};

const subtitle = {
  fontSize: "24px",
  color: "#a1a1aa",
  marginTop: "30px",
  lineHeight: "1.5",
};

const buttonContainer = {
  display: "flex",
  gap: "18px",
  marginTop: "45px",
};

const primaryBtn = {
  background: "white",
  color: "black",
  textDecoration: "none",
  padding: "16px 28px",
  borderRadius: "999px",
  fontWeight: 600,
};

const secondaryBtn = {
  background: "rgba(255,255,255,0.06)",
  color: "white",
  textDecoration: "none",
  padding: "16px 28px",
  borderRadius: "999px",
  fontWeight: 600,
  border: "1px solid rgba(255,255,255,0.1)",
};

const blueGlow = {
  position: "absolute" as const,
  width: "500px",
  height: "500px",
  background: "#2563eb",
  filter: "blur(180px)",
  opacity: 0.25,
  top: "15%",
  left: "10%",
  borderRadius: "50%",
};

const purpleGlow = {
  position: "absolute" as const,
  width: "500px",
  height: "500px",
  background: "#7c3aed",
  filter: "blur(180px)",
  opacity: 0.2,
  bottom: "10%",
  right: "10%",
  borderRadius: "50%",
};