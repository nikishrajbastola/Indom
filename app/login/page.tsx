"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import authStyles from "@/components/auth/Auth.module.css";
import { Button } from "@/components/ui/Button";
import formStyles from "@/components/ui/FormControls.module.css";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setError("We couldn’t complete your login. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setError("You’re signed in, but we couldn’t load your workspace.");
      setLoading(false);
      return;
    }

    if (profile.role === "student") {
      router.push("/student");
    } else if (profile.role === "organization") {
      router.push("/organization");
    } else if (profile.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  return (
    <main className={authStyles.page}>
      <div className={authStyles.shell}>
        <Link href="/" className={authStyles.brand} aria-label="Indom home">
          <span className={authStyles.brandMark} aria-hidden="true">I</span>
          Indom
        </Link>

        <section className={authStyles.card} aria-labelledby="login-title">
          <p className={authStyles.eyebrow}>Welcome back</p>
          <h1 id="login-title">Log in to Indom</h1>
          <p className={authStyles.description}>
            Continue to your student or organization workspace.
          </p>

          <form className={authStyles.form} onSubmit={handleLogin}>
            {error && (
              <p className={`${formStyles.notice} ${formStyles.noticeError}`} role="alert">
                {error}
              </p>
            )}

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
                  autoComplete="current-password"
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
            </div>

            <Button type="submit" loading={loading} className={authStyles.fullButton}>
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className={authStyles.accountLink}>
            New to Indom? <Link href="/signup">Create an account</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
