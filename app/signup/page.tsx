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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [signingUp, setSigningUp] = useState(false);

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const passwordValid = Object.values(passwordRules).every(Boolean);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!fullName.trim() || !email.trim()) {
      setFormError("Please enter your full name and email address.");
      return;
    }

    if (!passwordValid) {
      setFormError("Your password does not meet all password requirements.");
      return;
    }

    if (!passwordsMatch) {
      setFormError("Passwords do not match.");
      return;
    }

    setSigningUp(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      const user = data.user;

      if (user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              full_name: fullName.trim(),
              email: email.trim(),
              role: role,
            },
          ]);

        if (profileError) {
          setFormError(profileError.message);
          return;
        }

        alert("Account created successfully!");
      }
    } catch {
      setFormError("Something went wrong while creating your account.");
    } finally {
      setSigningUp(false);
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

        <form style={form} onSubmit={handleSignup}>
          <label htmlFor="full-name" style={label}>
            Full name
          </label>
          <input
            id="full-name"
            name="fullName"
            style={input}
            placeholder="Full name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setFormError("");
            }}
            autoComplete="name"
            required
          />

          <label htmlFor="email" style={label}>
            Email address
          </label>
          <input
            id="email"
            name="email"
            style={input}
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormError("");
            }}
            autoComplete="email"
            required
          />

          <label htmlFor="password" style={label}>
            Password
          </label>
          <div style={passwordWrapper}>
            <input
              id="password"
              name="password"
              style={passwordInput}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFormError("");
              }}
              autoComplete="new-password"
              aria-describedby="password-requirements"
              aria-invalid={password.length > 0 && !passwordValid}
              required
            />
            <button
              type="button"
              style={passwordToggle}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div id="password-requirements" style={requirements}>
            <p style={requirementsTitle}>Password must include:</p>
            <ul style={requirementsList} aria-live="polite">
              <Requirement met={passwordRules.length}>
                At least 8 characters
              </Requirement>
              <Requirement met={passwordRules.uppercase}>
                One uppercase letter
              </Requirement>
              <Requirement met={passwordRules.lowercase}>
                One lowercase letter
              </Requirement>
              <Requirement met={passwordRules.number}>One number</Requirement>
            </ul>
          </div>

          <label htmlFor="confirm-password" style={label}>
            Confirm password
          </label>
          <div style={passwordWrapper}>
            <input
              id="confirm-password"
              name="confirmPassword"
              style={passwordInput}
              placeholder="Confirm password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFormError("");
              }}
              autoComplete="new-password"
              aria-describedby="password-match-status"
              aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
              required
            />
            <button
              type="button"
              style={passwordToggle}
              onClick={() => setShowConfirmPassword((current) => !current)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
              aria-pressed={showConfirmPassword}
              title={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div id="password-match-status" aria-live="polite">
            {confirmPassword.length > 0 && (
              <p style={passwordsMatch ? matchText : mismatchText}>
                <span aria-hidden="true">{passwordsMatch ? "✓" : "×"}</span>{" "}
                {passwordsMatch
                  ? "Passwords match"
                  : "Passwords do not match."}
              </p>
            )}
          </div>

          {formError && (
            <p style={errorText} role="alert">
              {formError}
            </p>
          )}

          <button
            type="submit"
            style={{ ...button, ...(signingUp ? disabledButton : {}) }}
            disabled={signingUp}
          >
            {signingUp ? "Creating account..." : `Continue as ${role}`}
          </button>
        </form>

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

function Requirement({
  met,
  children,
}: {
  met: boolean;
  children: React.ReactNode;
}) {
  return (
    <li
      style={{ ...requirementItem, color: met ? "#86efac" : "#a1a1aa" }}
      aria-label={`${met ? "Requirement met" : "Requirement not met"}: ${children}`}
    >
      <span style={requirementIcon} aria-hidden="true">
        {met ? "✓" : "○"}
      </span>
      <span>{children}</span>
    </li>
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
  padding: "24px",
  boxSizing: "border-box" as const,
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
  boxSizing: "border-box" as const,
  margin: "auto 0",
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
  marginBottom: "20px",
};

const form = {
  display: "grid",
  gap: "10px",
};

const label = {
  fontSize: "14px",
  fontWeight: 700,
  marginTop: "4px",
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
  color: "#93c5fd",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  padding: "6px",
};

const requirements = {
  padding: "4px 2px 2px",
};

const requirementsTitle = {
  margin: "0 0 8px",
  color: "#d4d4d8",
  fontSize: "14px",
};

const requirementsList = {
  display: "grid",
  gap: "6px",
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const requirementItem = {
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  fontSize: "14px",
  lineHeight: 1.4,
};

const requirementIcon = {
  width: "16px",
  flex: "0 0 16px",
  textAlign: "center" as const,
  fontWeight: 700,
};

const matchText = {
  color: "#86efac",
  fontSize: "14px",
  margin: "0 2px 2px",
};

const mismatchText = {
  ...matchText,
  color: "#fca5a5",
};

const errorText = {
  color: "#fca5a5",
  fontSize: "14px",
  lineHeight: 1.5,
  margin: "2px",
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
