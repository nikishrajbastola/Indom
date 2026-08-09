"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import authStyles from "@/components/auth/Auth.module.css";
import { Button } from "@/components/ui/Button";
import formStyles from "@/components/ui/FormControls.module.css";
import { supabase } from "@/lib/supabase";

function SignupContent() {
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role");
  const role = requestedRole === "organization" ? "organization" : "student";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          full_name: fullName,
          email,
          role,
        },
      ]);

      if (profileError) {
        setError("Your account was created, but we couldn’t finish setting up your profile.");
        setLoading(false);
        return;
      }
    }

    setSuccess("Account created. You can now continue to log in.");
    setLoading(false);
  };

  return (
    <main className={authStyles.page}>
      <div className={authStyles.shell}>
        <Link href="/" className={authStyles.brand} aria-label="Indom home">
          <span className={authStyles.brandMark} aria-hidden="true">I</span>
          Indom
        </Link>

        <section className={authStyles.card} aria-labelledby="signup-title">
          <p className={authStyles.eyebrow}>Create your account</p>
          <h1 id="signup-title">Start with Indom</h1>
          <p className={authStyles.description}>
            Choose the workspace that matches how you’ll use the product.
          </p>

          <div className={authStyles.roleSwitch} aria-label="Account type">
            <Link
              href="/signup?role=student"
              className={role === "student" ? authStyles.activeRole : ""}
              aria-current={role === "student" ? "true" : undefined}
            >
              Student
            </Link>
            <Link
              href="/signup?role=organization"
              className={role === "organization" ? authStyles.activeRole : ""}
              aria-current={role === "organization" ? "true" : undefined}
            >
              Organization
            </Link>
          </div>

          <form className={authStyles.form} onSubmit={handleSignup}>
            {error && (
              <p className={`${formStyles.notice} ${formStyles.noticeError}`} role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className={`${formStyles.notice} ${formStyles.noticeSuccess}`} role="status">
                {success}
              </p>
            )}

            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="full-name">
                {role === "organization" ? "Organization name" : "Full name"}
              </label>
              <input
                id="full-name"
                className={formStyles.input}
                autoComplete="name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>

            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="email">Email address</label>
              <input
                id="email"
                className={formStyles.input}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="password">Password</label>
              <div className={formStyles.passwordWrap}>
                <input
                  id="password"
                  className={formStyles.input}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className={formStyles.passwordToggle}
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className={formStyles.help}>Use at least 6 characters.</p>
            </div>

            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                className={formStyles.input}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={6}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            <Button type="submit" loading={loading} className={authStyles.fullButton}>
              {loading ? "Creating account…" : `Continue as ${role}`}
            </Button>
          </form>

          <p className={authStyles.accountLink}>
            Already have an account? <Link href={`/login?role=${role}`}>Log in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className={authStyles.page}>Loading…</main>}>
      <SignupContent />
    </Suspense>
  );
}
