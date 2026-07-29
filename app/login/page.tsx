"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    setLoggingIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const user = data.user;

      if (!user) {
        alert("Login failed. Please try again.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        alert(profileError.message);
        return;
      }

      if (!profile) {
        alert("No profile was found for this account.");
        return;
      }

      if (profile.role === "admin") {
        router.replace("/admin/organizations");
      } else if (profile.role === "organization") {
        router.replace("/organization");
      } else if (profile.role === "student") {
        router.replace("/student");
      } else {
        alert("This account does not have a valid role.");
        router.replace("/");
      }
    } catch {
      alert("Something went wrong while logging in.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <main style={page}>
      <section style={card}>
        <Link href="/" style={brand}>
          Indom
        </Link>

        <h1 style={title}>Welcome back</h1>

        <p style={subtitle}>Log in to continue your work.</p>

        <div style={form}>
          <input
            style={input}
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="email"
          />

          <div style={passwordWrapper}>
            <input
              style={passwordInput}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />

            <button
              type="button"
              style={passwordToggle}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="button"
            style={{
              ...button,
              ...(loggingIn ? disabledButton : {}),
            }}
            onClick={handleLogin}
            disabled={loggingIn}
          >
            {loggingIn ? "Logging in..." : "Log in"}
          </button>
        </div>

        <p style={bottomText}>
          New to Indom?{" "}
          <Link href="/signup" style={link}>
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 50% 20%, rgba(124,58,237,0.22), transparent 32%), #000",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const card = {
  width: "100%",
  maxWidth: "440px",
  padding: "42px",
  borderRadius: "32px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.09)",
};

const brand = {
  color: "white",
  textDecoration: "none",
  fontSize: "22px",
  fontWeight: 700,
};

const title = {
  fontSize: "44px",
  margin: "20px 0 10px",
  letterSpacing: "-0.04em",
};

const subtitle = {
  color: "#aaa",
  marginBottom: "24px",
};

const form = {
  display: "grid",
  gap: "14px",
};

const input = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "16px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#1a1a1a",
  color: "white",
  fontSize: "16px",
  outline: "none",
};

const passwordWrapper = {
  position: "relative" as const,
  width: "100%",
};

const passwordInput = {
  ...input,
  paddingRight: "82px",
};

const passwordToggle = {
  position: "absolute" as const,
  top: "50%",
  right: "14px",
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  color: "#c4b5fd",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  padding: "6px",
};

const button = {
  padding: "16px",
  borderRadius: "999px",
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 700,
  fontSize: "16px",
  cursor: "pointer",
};

const disabledButton = {
  opacity: 0.6,
  cursor: "not-allowed",
};

const bottomText = {
  marginTop: "20px",
  color: "#aaa",
};

const link = {
  color: "white",
};