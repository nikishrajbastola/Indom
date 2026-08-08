import Link from "next/link";
import auth from "@/components/auth/Auth.module.css";
import { ButtonLink } from "@/components/ui/Button";

export default function OrganizationAuthPage() {
  return <main className={auth.choicePage}><section className={auth.choiceIntro}><Link href="/" className={auth.brand}><span className={auth.brandMark}>I</span>Indom</Link><div className={auth.choiceCopy}><span>For organizations</span><h1>Move important work forward.</h1><p>Publish focused projects and connect with student talent ready to contribute.</p></div></section><section className={auth.choicePanel}><div className={auth.card}><div className={auth.heading}><h1>Continue as an organization</h1><p>Create an account or log in to publish projects.</p></div><div className={auth.choiceActions}><ButtonLink href="/signup?role=organization">Create organization account</ButtonLink><ButtonLink href="/login?role=organization" variant="secondary">Log in</ButtonLink></div></div></section></main>;
}
