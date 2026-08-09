"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import auth from "@/components/auth/Auth.module.css";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormField, TextInput } from "@/components/ui/FormControls";
import workspace from "@/components/ui/Workspace.module.css";
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [signingUp, setSigningUp] = useState(false);

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const passwordValid = Object.values(passwordRules).every(Boolean);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");
    if (!fullName.trim() || !email.trim()) return setFormError("Please enter your full name and email address.");
    if (!passwordValid) return setFormError("Your password does not meet all password requirements.");
    if (!passwordsMatch) return setFormError("Passwords do not match.");
    setSigningUp(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) {
        setFormError(error.message);
        return;
      }
      const user = data.user;
      if (user) {
        const { error: profileError } = await supabase.from("profiles").insert([{ id: user.id, full_name: fullName.trim(), email: email.trim(), role }]);
        if (profileError) {
          setFormError(profileError.message);
          return;
        }
        setSuccessMessage("Account created successfully. You can now log in.");
      }
    } catch {
      setFormError("Something went wrong while creating your account.");
    } finally {
      setSigningUp(false);
    }
  };

  return (
    <main className={auth.page}>
      <section className={auth.card}>
        <Link href="/" className={auth.brand}><span className={auth.brandMark}>I</span>Indom</Link>
        <div className={auth.heading}><Badge tone="info">{role === "organization" ? "Organization" : "Student"} account</Badge><h1>Create your account</h1><p>Start building real experience through focused projects.</p></div>
        <div className={auth.roleSwitch} aria-label="Account type">
          <Link href="/signup?role=student" className={role === "student" ? auth.activeRole : ""} aria-current={role === "student" ? "true" : undefined}>Student</Link>
          <Link href="/signup?role=organization" className={role === "organization" ? auth.activeRole : ""} aria-current={role === "organization" ? "true" : undefined}>Organization</Link>
        </div>
        {formError && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{formError}</p>}
        {successMessage && <p className={`${workspace.notice} ${workspace.noticeSuccess}`} role="status">{successMessage}</p>}
        <form className={auth.form} onSubmit={handleSignup}>
          <FormField label={role === "organization" ? "Organization name" : "Full name"} htmlFor="full-name"><TextInput id="full-name" name="fullName" value={fullName} onChange={(event) => { setFullName(event.target.value); setFormError(""); }} autoComplete="name" required /></FormField>
          <FormField label="Email address" htmlFor="email"><TextInput id="email" name="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setFormError(""); }} autoComplete="email" required /></FormField>
          <FormField label="Password" htmlFor="password">
            <div className={auth.passwordField}><TextInput id="password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); setFormError(""); }} autoComplete="new-password" minLength={8} aria-describedby="password-requirements" aria-invalid={password.length > 0 && !passwordValid} required /><button type="button" className={auth.passwordToggle} onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button></div>
          </FormField>
          <div id="password-requirements" className={auth.requirements}><p className={auth.requirementsTitle}>Password must include:</p><ul className={auth.requirementsList} aria-live="polite"><Requirement met={passwordRules.length}>At least 8 characters</Requirement><Requirement met={passwordRules.uppercase}>One uppercase letter</Requirement><Requirement met={passwordRules.lowercase}>One lowercase letter</Requirement><Requirement met={passwordRules.number}>One number</Requirement></ul></div>
          <FormField label="Confirm password" htmlFor="confirm-password">
            <div className={auth.passwordField}><TextInput id="confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setFormError(""); }} autoComplete="new-password" minLength={8} aria-describedby="password-match-status" aria-invalid={confirmPassword.length > 0 && !passwordsMatch} required /><button type="button" className={auth.passwordToggle} onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={showConfirmPassword}>{showConfirmPassword ? "Hide" : "Show"}</button></div>
          </FormField>
          <div id="password-match-status" aria-live="polite">{confirmPassword.length > 0 && <p className={passwordsMatch ? auth.match : auth.mismatch}>{passwordsMatch ? "✓ Passwords match" : "× Passwords do not match"}</p>}</div>
          <Button type="submit" loading={signingUp}>{signingUp ? "Creating account…" : `Continue as ${role}`}</Button>
        </form>
        <p className={auth.footer}>Already have an account? <Link className={auth.link} href={`/login?role=${role}`}>Log in</Link></p>
      </section>
    </main>
  );
}

function Requirement({ met, children }: { met: boolean; children: React.ReactNode }) {
  return <li className={`${auth.requirement} ${met ? auth.requirementMet : ""}`} aria-label={`${met ? "Requirement met" : "Requirement not met"}: ${children}`}><span aria-hidden="true">{met ? "✓" : "○"}</span><span>{children}</span></li>;
}

export default function SignupPage() {
  return <Suspense fallback={<main className={auth.page}><p>Loading…</p></main>}><SignupContent /></Suspense>;
}
