import Link from "next/link";

export default function StudentAuthPage() {
  return (
    <main style={page}>
      <section style={left}>
        <Link href="/" style={logo}>Indom</Link>

        <div>
          <p style={tag}>FOR STUDENTS</p>
          <h1 style={title}>Your first real project starts here.</h1>
          <p style={subtitle}>
            Join short projects from startups, labs, and organizations. Build proof before graduation.
          </p>
        </div>
      </section>

      <section style={right}>
        <div style={card}>
          <h2 style={cardTitle}>Continue as Student</h2>
          <p style={cardText}>Create an account or log in to browse projects.</p>

          <Link href="/signup?role=student" style={primary}>
            Create Student Account
          </Link>

          <Link href="/login?role=student" style={secondary}>
            Log In
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
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const left = {
  padding: "56px",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  background:
    "radial-gradient(circle at 30% 30%, rgba(37,99,235,0.35), transparent 35%), #050505",
};

const logo = {
  color: "white",
  textDecoration: "none",
  fontSize: "22px",
  fontWeight: 700,
};

const tag = {
  color: "#60a5fa",
  letterSpacing: "0.18em",
  fontSize: "13px",
  fontWeight: 700,
};

const title = {
  fontSize: "72px",
  lineHeight: "0.95",
  letterSpacing: "-0.07em",
  margin: "20px 0",
};

const subtitle = {
  maxWidth: "560px",
  color: "#b5b5b5",
  fontSize: "22px",
  lineHeight: "1.5",
};

const right = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px",
  background: "#030303",
};

const card = {
  width: "100%",
  maxWidth: "430px",
  padding: "36px",
  borderRadius: "28px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const cardTitle = {
  fontSize: "32px",
  marginBottom: "10px",
};

const cardText = {
  color: "#a1a1aa",
  marginBottom: "28px",
};

const primary = {
  display: "block",
  background: "white",
  color: "black",
  padding: "15px",
  borderRadius: "999px",
  textAlign: "center" as const,
  textDecoration: "none",
  fontWeight: 700,
  marginBottom: "14px",
};

const secondary = {
  display: "block",
  color: "white",
  padding: "15px",
  borderRadius: "999px",
  textAlign: "center" as const,
  textDecoration: "none",
  fontWeight: 700,
  border: "1px solid rgba(255,255,255,0.18)",
};