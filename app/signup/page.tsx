"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function SignupContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "student";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            full_name: fullName,
            email: email,
            role: role,
          },
        ]);

      if (profileError) {
        alert(profileError.message);
        return;
      }

      alert("Account created successfully!");
    }
  };

  return (
    <main style={page}>
      <section style={card}>
        <Link href="/" style={brand}>
          Indom
        </Link>

        <h1 style={title}>Create your account</h1>

        <p style={subtitle}>
          Start building real experience through real projects.
        </p>

        <div style={form}>
          <input
            style={input}
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            style={input}
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={input}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={button} onClick={handleSignup}>
            Continue as {role}
          </button>
        </div>

        <p style={bottomText}>
          Already have an account?{" "}
          <Link href="/login" style={link}>
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main style={page}>Loading...</main>}>
      <SignupContent />
    </Suspense>
  );
}

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 50% 20%, rgba(37,99,235,0.22), transparent 32%), #000",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const card = {
  width: "100%",
  maxWidth: "440px",
  padding: "42px",
  borderRadius: "32px",
  background: "rgba(255,255,255,0.06)",
};

const brand = {
  color: "white",
  textDecoration: "none",
  fontSize: "22px",
  fontWeight: 700,
};

const title = {
  fontSize: "44px",
  margin: "20px 0",
};

const subtitle = {
  color: "#aaa",
  marginBottom: "20px",
};

const form = {
  display: "grid",
  gap: "14px",
};

const input = {
  padding: "16px",
  borderRadius: "16px",
  border: "none",
  background: "#1a1a1a",
  color: "white",
};

const button = {
  padding: "16px",
  borderRadius: "999px",
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 700,
  cursor: "pointer",
};

const bottomText = {
  marginTop: "20px",
};

const link = {
  color: "white",
};