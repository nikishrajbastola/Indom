import Link from "next/link";
import auth from "@/components/auth/Auth.module.css";
import { ButtonLink } from "@/components/ui/Button";

export default function StudentAuthPage() {
  return <main className={auth.choicePage}><section className={auth.choiceIntro}><Link href="/" className={auth.brand}><span className={auth.brandMark}>I</span>Indom</Link><div className={auth.choiceCopy}><span>For students</span><h1>Your first real project starts here.</h1><p>Join focused projects from startups, labs, and organizations. Build credible experience before graduation.</p></div></section><section className={auth.choicePanel}><div className={auth.card}><div className={auth.heading}><h1>Continue as a student</h1><p>Create an account or log in to browse projects.</p></div><div className={auth.choiceActions}><ButtonLink href="/signup?role=student">Create student account</ButtonLink><ButtonLink href="/login?role=student" variant="secondary">Log in</ButtonLink></div></div></section></main>;
}
