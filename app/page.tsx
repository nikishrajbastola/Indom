import { LandingHeader } from "@/components/landing/LandingHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "@/components/landing/LandingPage.module.css";

const studentSteps = [
  {
    number: "01",
    title: "Discover",
    description: "Find focused projects aligned with your interests and skills.",
  },
  {
    number: "02",
    title: "Apply",
    description: "Share your profile and show organizations what you can contribute.",
  },
  {
    number: "03",
    title: "Build proof",
    description: "Complete meaningful work and create evidence of your capabilities.",
  },
] as const;

const studentBenefits = [
  "Gain experience through short, scoped projects",
  "Build portfolio evidence around completed work",
  "Explore professional interests before larger commitments",
  "Develop relationships with organizations and project teams",
] as const;

const organizationBenefits = [
  "Connect with motivated student talent",
  "Move clearly scoped projects forward",
  "Discover emerging contributors through real collaboration",
  "Support students as they develop practical experience",
] as const;

export default function Home() {
  return (
    <main className={styles.page}>
      <LandingHeader />

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <Badge tone="info">Real projects. Practical experience.</Badge>
              <h1 id="hero-title">Build experience before you have experience.</h1>
              <p>
                Work on real projects from researchers, startups, and
                organizations while building proof of what you can do.
              </p>
              <div className={styles.heroActions}>
                <ButtonLink href="/auth/student">Explore projects</ButtonLink>
                <ButtonLink href="/auth/organization" variant="secondary">
                  Post a project
                </ButtonLink>
              </div>
              <p className={styles.heroNote}>
                Built for focused opportunities and credible professional growth.
              </p>
            </div>

            <ProductPreview compact />
          </div>
        </div>
      </section>

      <section className={styles.credibility} aria-label="Why Indom">
        <div className={`${styles.container} ${styles.credibilityGrid}`}>
          <p>Built for students seeking real-world experience</p>
          <p>Designed around short, clearly scoped projects</p>
          <p>Separate workspaces for students and organizations</p>
        </div>
      </section>

      <section className={styles.section} id="how-it-works" aria-labelledby="how-title">
        <div className={styles.container}>
          <SectionHeading
            eyebrow="How it works"
            title="A clear path from discovery to demonstrated work"
            description="Indom keeps the process focused so students and organizations know what happens next."
            id="how-title"
          />

          <div className={styles.stepsGrid}>
            {studentSteps.map((step) => (
              <Card key={step.number} className={styles.stepCard}>
                <span className={styles.stepNumber}>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </Card>
            ))}
          </div>

          <Card className={styles.organizationFlow}>
            <div>
              <p className={styles.eyebrow}>For organizations</p>
              <h3>Post, review, collaborate</h3>
            </div>
            <ol>
              <li><span>1</span> Post a focused project</li>
              <li><span>2</span> Review interested students</li>
              <li><span>3</span> Move meaningful work forward</li>
            </ol>
          </Card>
        </div>
      </section>

      <section className={`${styles.section} ${styles.alternateSection}`} id="students" aria-labelledby="students-title">
        <div className={`${styles.container} ${styles.valueGrid}`}>
          <div className={styles.valueCopy}>
            <SectionHeading
              eyebrow="For students"
              title="Turn your ability into evidence"
              description="Move beyond potential by contributing to practical work you can discuss, document, and learn from."
              id="students-title"
            />
            <ButtonLink href="/auth/student">Start as a student</ButtonLink>
          </div>
          <Card className={styles.benefitCard}>
            <ul className={styles.benefitList}>
              {studentBenefits.map((benefit) => (
                <li key={benefit}><CheckIcon />{benefit}</li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className={styles.section} id="organizations" aria-labelledby="organizations-title">
        <div className={`${styles.container} ${styles.valueGrid}`}>
          <Card className={`${styles.benefitCard} ${styles.organizationCard}`}>
            <ul className={styles.benefitList}>
              {organizationBenefits.map((benefit) => (
                <li key={benefit}><CheckIcon />{benefit}</li>
              ))}
            </ul>
          </Card>
          <div className={styles.valueCopy}>
            <SectionHeading
              eyebrow="For organizations"
              title="Find contributors through real work"
              description="Publish well-defined opportunities, review student profiles, and build working relationships around useful projects."
              id="organizations-title"
            />
            <ButtonLink href="/auth/organization">Post a project</ButtonLink>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.previewSection}`} id="product" aria-labelledby="product-title">
        <div className={styles.container}>
          <SectionHeading
            eyebrow="The product"
            title="One focused workspace for every step"
            description="Discover projects, track applications, maintain profiles, and review applicants using the same clear Indom experience."
            id="product-title"
            centered
          />
          <div className={styles.fullPreview}><ProductPreview /></div>
          <p className={styles.previewCaption}>
            Interface preview based on the current Indom student workspace. No sample projects or fabricated activity are shown.
          </p>
        </div>
      </section>

      <section className={styles.finalSection} aria-labelledby="final-title">
        <div className={`${styles.container} ${styles.finalGrid}`}>
          <div>
            <p className={styles.eyebrow}>For students</p>
            <h2 id="final-title">Ready to build real experience?</h2>
            <p>Explore focused opportunities and begin building proof of what you can do.</p>
            <ButtonLink href="/auth/student">Explore projects</ButtonLink>
          </div>
          <div>
            <p className={styles.eyebrow}>For organizations</p>
            <h2>Have a project that needs momentum?</h2>
            <p>Share a clear opportunity and connect with students ready to contribute.</p>
            <ButtonLink href="/auth/organization" variant="secondary">Post a project</ButtonLink>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div>
            <a className={styles.brand} href="#top"><span aria-hidden="true">I</span>Indom</a>
            <p>Real projects. Practical experience.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#product">Product</a>
            <a href="#students">Students</a>
            <a href="#organizations">Organizations</a>
            <ButtonLink href="/login" variant="ghost" size="small">Log in</ButtonLink>
            <ButtonLink href="/signup" variant="secondary" size="small">Sign up</ButtonLink>
          </nav>
        </div>
      </footer>
    </main>
  );
}

function SectionHeading({ eyebrow, title, description, id, centered = false }: { eyebrow: string; title: string; description: string; id: string; centered?: boolean }) {
  return <header className={`${styles.sectionHeading} ${centered ? styles.centeredHeading : ""}`}><p className={styles.eyebrow}>{eyebrow}</p><h2 id={id}>{title}</h2><p>{description}</p></header>;
}

function ProductPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${styles.productFrame} ${compact ? styles.compactPreview : ""}`} aria-label="Preview of the Indom student workspace">
      <div className={styles.previewSidebar}>
        <div className={styles.previewBrand}><span>I</span>Indom</div>
        <div className={styles.previewNavigation}>
          <span className={styles.previewActive}>Overview</span>
          <span>Discover</span>
          <span>Applications</span>
          <span>Profile</span>
        </div>
      </div>
      <div className={styles.previewContent}>
        <div className={styles.previewHeader}>
          <div><span>Student overview</span><strong>Your opportunity workspace</strong></div>
          <span className={styles.previewButton}>Browse projects</span>
        </div>
        <div className={styles.previewMetrics}>
          <div><span>Applications</span><strong>Track your progress</strong></div>
          <div><span>Profile strength</span><strong>Present your skills</strong></div>
        </div>
        <div className={styles.previewPanel}>
          <div><span>In progress</span><strong>Your applications</strong></div>
          <div className={styles.previewRows}><i /><i /><i /></div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return <span className={styles.checkIcon} aria-hidden="true"><svg viewBox="0 0 20 20"><path d="m5 10 3 3 7-7" /></svg></span>;
}
