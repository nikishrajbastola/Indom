import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import styles from "./Auth.module.css";

export function RoleEntryPage({
  role,
  eyebrow,
  title,
  description,
  benefits,
}: {
  role: "student" | "organization";
  eyebrow: string;
  title: string;
  description: string;
  benefits: readonly string[];
}) {
  const roleLabel = role === "student" ? "Student" : "Organization";

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.brand} aria-label="Indom home">
          <span className={styles.brandMark} aria-hidden="true">I</span>
          Indom
        </Link>
        <section className={styles.card} aria-labelledby="role-entry-title">
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="role-entry-title">{title}</h1>
          <p className={styles.description}>{description}</p>
          <div className={styles.choiceActions}>
            <ButtonLink href={`/signup?role=${role}`}>
              Create {roleLabel.toLowerCase()} account
            </ButtonLink>
            <ButtonLink href={`/login?role=${role}`} variant="secondary">
              Log in
            </ButtonLink>
          </div>
          <ul className={styles.benefits}>
            {benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
          </ul>
        </section>
        <Link href="/" className={styles.backLink}>← Back to Indom</Link>
      </div>
    </main>
  );
}
