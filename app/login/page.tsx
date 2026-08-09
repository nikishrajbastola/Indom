"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import auth from "@/components/auth/Auth.module.css";
import { Button } from "@/components/ui/Button";
import { FormField, TextInput } from "@/components/ui/FormControls";
import workspace from "@/components/ui/Workspace.module.css";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Enter your email and password.");
      return;
    }
    setLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      const user = data.user;
      if (!user) {
        setErrorMessage("Login failed. Please try again.");
        return;
      }
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profileError || !profile) {
        setErrorMessage(profileError?.message || "No profile was found for this account.");
        return;
      }
      if (profile.role === "admin") router.replace("/admin/organizations");
      else if (profile.role === "organization") router.replace("/organization");
      else if (profile.role === "student") router.replace("/student");
      else {
        setErrorMessage("This account does not have a valid role.");
        router.replace("/");
      }
    } catch {
      setErrorMessage("Something went wrong while logging in.");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <main className={auth.page}>
      <section className={auth.card}>
        <Link href="/" className={auth.brand}><span className={auth.brandMark}>I</span>Indom</Link>
        <div className={auth.heading}><h1>Welcome back</h1><p>Log in to continue your work.</p></div>
        {errorMessage && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{errorMessage}</p>}
        <form className={auth.form} onSubmit={handleLogin}>
          <FormField label="Email address" htmlFor="email"><TextInput id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></FormField>
          <FormField label="Password" htmlFor="password"><div className={auth.passwordField}><TextInput id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /><button type="button" className={auth.passwordToggle} onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button></div></FormField>
          <Button type="submit" loading={loggingIn}>{loggingIn ? "Logging in…" : "Log in"}</Button>
        </form>
        <p className={auth.footer}>New to Indom? <Link className={auth.link} href="/signup">Create account</Link></p>
      </section>
    </main>
  );
}
