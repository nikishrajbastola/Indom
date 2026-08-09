import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import styles from "@/components/marketing/LandingPage.module.css";

export const metadata: Metadata = {
  title: "Indom — Build Experience Through Real Work",
  description:
    "Indom connects students with real-world projects from researchers, startups, and organizations so they can build practical experience and proof of their skills.",
};

const studentSteps = [
  {
    number: "01",
    title: "Discover",
    description: "Find projects from researchers, startups, and organizations.",
  },
  {
    number: "02",
    title: "Apply",
    description:
      "Pursue opportunities where your skills and interests can contribute.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "Work on real problems and build evidence of what you can do.",
  },
] as const;

const productFeatures = [
  {
    title: "Discover opportunities",
    description: "Browse real project opportunities in one focused workspace.",
    icon: "compass",
  },
  {
    title: "Apply with context",
    description:
      "Use your Indom profile and experience to pursue relevant projects.",
    icon: "send",
  },
  {
    title: "Track your progress",
    description: "See your applications and their status in one place.",
    icon: "status",
  },
  {
    title: "Build your profile",
    description: "Maintain your skills, resume, links, and professional story.",
    icon: "profile",
  },
] as const;

const studentBenefits = [
  "Work on meaningful, scoped problems",
  "Explore career interests through practice",
  "Apply classroom and personal-project skills",
  "Build portfolio evidence from real work",
  "Develop stories you can discuss in interviews",
  "Gain exposure to real collaboration",
] as const;

const organizationBenefits = [
  "Post clear project opportunities",
  "Review interested students",
  "Manage applicants in one place",
  "Give students meaningful exposure",
  "Discover emerging talent through real work",
] as const;

export default function Home() {
  return (
    <div className={styles.page}>
      <MarketingHeader />

      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <p className={`${styles.eyebrowPill} ${styles.heroEyebrow}`}>
                <span aria-hidden="true" /> Real work. Real experience.
              </p>
              <h1 id="hero-title" className={styles.heroTitle}>
                Build experience before you have experience.
              </h1>
              <p className={styles.heroDescription}>
                Work on real projects from researchers, startups, and
                organizations. Build skills, create proof of your work, and gain
                experience you can actually talk about.
              </p>
              <div className={styles.heroActions}>
                <Link
                  href="/auth/student"
                  className={styles.primaryButton}
                  data-analytics-event="explore_projects_clicked"
                >
                  Explore projects <ArrowIcon />
                </Link>
                <Link
                  href="/auth/organization"
                  className={styles.secondaryButton}
                  data-analytics-event="post_project_clicked"
                >
                  Post a project
                </Link>
              </div>
              <p className={styles.heroFootnote}>
                Built for students and the teams ready to give their skills
                somewhere meaningful to go.
              </p>
            </div>

            <div className={styles.heroPreview}>
              <ProductPreview />
            </div>
          </div>
        </section>

        <section className={styles.credibility} aria-labelledby="credibility-title">
          <div className={`${styles.container} ${styles.credibilityInner}`}>
            <p className={styles.sectionEyebrow}>Built around a real problem</p>
            <h2 id="credibility-title">
              Talent is everywhere. The first meaningful opportunity is not.
            </h2>
            <p>
              Indom is designed for the gap between learning a skill and getting
              the chance to use it in a real working environment.
            </p>
          </div>
        </section>

        <section className={styles.problemSection} aria-labelledby="problem-title">
          <div className={`${styles.container} ${styles.problemGrid}`}>
            <div>
              <p className={styles.sectionEyebrow}>The experience paradox</p>
              <h2 id="problem-title">
                You need experience to get opportunities. But you need an
                opportunity to build experience.
              </h2>
            </div>
            <div className={styles.problemAnswer}>
              <span className={styles.answerMark} aria-hidden="true">
                ↳
              </span>
              <p>
                Indom creates another path: real projects, real collaboration,
                and real work students can learn from and discuss.
              </p>
            </div>
          </div>
        </section>

        <section
          className={styles.section}
          id="how-it-works"
          aria-labelledby="how-it-works-title"
        >
          <div className={styles.container}>
            <SectionHeading
              eyebrow="How Indom works"
              title="From interest to real contribution."
              description="A simple process that keeps the focus on useful work and what you can bring to it."
              id="how-it-works-title"
            />

            <ol className={styles.stepsGrid}>
              {studentSteps.map((step) => (
                <li key={step.number} className={styles.step}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.productSection}`}
          id="product"
          aria-labelledby="product-title"
        >
          <div className={styles.container}>
            <SectionHeading
              eyebrow="The product"
              title="Everything you need to turn skills into experience."
              description="A focused workspace for discovering projects, applying with context, and keeping your professional profile current."
              id="product-title"
              centered
            />

            <div className={styles.productExperience}>
              <div className={styles.expandedPreview}>
                <ProductPreview expanded />
              </div>
              <div className={styles.featureGrid}>
                {productFeatures.map((feature) => (
                  <article key={feature.title} className={styles.featureItem}>
                    <FeatureIcon name={feature.icon} />
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.section}
          id="students"
          aria-labelledby="students-title"
        >
          <div className={`${styles.container} ${styles.studentGrid}`}>
            <div className={styles.studentCopy}>
              <SectionHeading
                eyebrow="For students"
                title="Your skills deserve somewhere to be used."
                description="Move from knowing what you can do to having work that helps you show it."
                id="students-title"
              />
              <Link
                href="/auth/student"
                className={styles.primaryButton}
                data-analytics-event="student_signup_started"
              >
                Start as a student <ArrowIcon />
              </Link>
            </div>

            <ul className={styles.benefitGrid}>
              {studentBenefits.map((benefit) => (
                <li key={benefit}>
                  <CheckIcon />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className={styles.organizationSection}
          id="organizations"
          aria-labelledby="organizations-title"
        >
          <div className={`${styles.container} ${styles.organizationGrid}`}>
            <div className={styles.organizationCopy}>
              <p className={styles.sectionEyebrow}>For organizations</p>
              <h2 id="organizations-title">Have a project that needs momentum?</h2>
              <p>
                Post scoped opportunities, connect with motivated students, and
                discover emerging talent through real work.
              </p>
              <Link
                href="/auth/organization"
                className={styles.primaryButton}
                data-analytics-event="organization_signup_started"
              >
                Post a project <ArrowIcon />
              </Link>
            </div>

            <div className={styles.organizationCard}>
              <div className={styles.organizationCardHeader}>
                <span className={styles.orgIcon} aria-hidden="true">
                  <BriefcaseIcon />
                </span>
                <span>Organization workspace</span>
              </div>
              <ul>
                {organizationBenefits.map((benefit) => (
                  <li key={benefit}>
                    <CheckIcon />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.marketplaceSection} aria-labelledby="marketplace-title">
          <div className={styles.container}>
            <SectionHeading
              eyebrow="One marketplace, two needs"
              title="Good work starts with the right connection."
              description="Indom brings students looking for experience together with teams that have meaningful work to move forward."
              id="marketplace-title"
              centered
            />

            <div className={styles.marketplaceFlow}>
              <div className={styles.marketplaceSide}>
                <span className={styles.marketplaceLabel}>Students</span>
                <strong>Want experience</strong>
                <p>Bring curiosity, skills, and the motivation to contribute.</p>
              </div>

              <div className={styles.flowLine} aria-hidden="true">
                <span />
              </div>

              <div className={styles.indomNode}>
                <span className={styles.brandMark} aria-hidden="true">
                  I
                </span>
                <strong>Indom</strong>
                <small>Real collaboration</small>
              </div>

              <div className={styles.flowLine} aria-hidden="true">
                <span />
              </div>

              <div className={styles.marketplaceSide}>
                <span className={styles.marketplaceLabel}>Organizations</span>
                <strong>Have meaningful projects</strong>
                <p>Bring scoped work and space for students to contribute.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="final-cta-title">
          <div className={`${styles.container} ${styles.finalCtaInner}`}>
            <div>
              <p className={styles.sectionEyebrow}>Start with real work</p>
              <h2 id="final-cta-title">
                Your first opportunity shouldn&apos;t require your first opportunity.
              </h2>
              <p>Start building experience through real work.</p>
            </div>
            <div className={styles.finalActions}>
              <Link
                href="/auth/student"
                className={styles.primaryButton}
                data-analytics-event="explore_projects_clicked"
              >
                Explore projects <ArrowIcon />
              </Link>
              <Link
                href="/auth/organization"
                className={styles.secondaryButton}
                data-analytics-event="post_project_clicked"
              >
                Post a project
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerTop}`}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.brand} aria-label="Indom home">
              <span className={styles.brandMark} aria-hidden="true">
                I
              </span>
              Indom
            </Link>
            <p>Build experience through real work.</p>
          </div>

          <div className={styles.footerLinks}>
            <div>
              <p>Product</p>
              <a href="#how-it-works">How it works</a>
              <a href="#students">Students</a>
              <a href="#organizations">Organizations</a>
            </div>
            <div>
              <p>Account</p>
              <Link href="/login">Log in</Link>
              <Link href="/signup?role=student">Student sign up</Link>
              <Link href="/signup?role=organization">Organization sign up</Link>
            </div>
          </div>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>
          <p>© {new Date().getFullYear()} Indom. All rights reserved.</p>
          <p>Real projects. Practical experience.</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  id: string;
  centered?: boolean;
}) {
  return (
    <header
      className={`${styles.sectionHeading} ${centered ? styles.centeredHeading : ""}`}
    >
      <p className={styles.sectionEyebrow}>{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

function ProductPreview({ expanded = false }: { expanded?: boolean }) {
  return (
    <figure
      className={`${styles.productPreview} ${expanded ? styles.productPreviewExpanded : ""}`}
    >
      <div className={styles.previewTopbar} aria-hidden="true">
        <span className={styles.previewDots}>
          <i />
          <i />
          <i />
        </span>
        <span>Student workspace</span>
        <span className={styles.previewSample}>Sample view</span>
      </div>

      <div className={styles.previewShell} aria-hidden="true">
        <aside className={styles.previewSidebar}>
          <div className={styles.previewBrand}>
            <span>I</span> Indom
          </div>
          <nav>
            <span className={styles.previewActive}>Overview</span>
            <span>Discover</span>
            <span>Applications</span>
            <span>Profile</span>
          </nav>
          <span className={styles.previewAccount}>AX</span>
        </aside>

        <div className={styles.previewContent}>
          <div className={styles.previewHeading}>
            <div>
              <span>Student overview</span>
              <strong>Good morning, Alex</strong>
              <p>Here&apos;s what&apos;s happening with your opportunities.</p>
            </div>
            <span className={styles.previewCta}>Browse projects</span>
          </div>

          <div className={styles.previewStats}>
            <div>
              <span>Applications</span>
              <strong>Track your progress</strong>
              <i>View applications →</i>
            </div>
            <div>
              <span>Profile</span>
              <strong>Present your skills</strong>
              <i>Complete profile →</i>
            </div>
          </div>

          <div className={styles.previewLowerGrid}>
            <div className={styles.previewPanel}>
              <div className={styles.previewPanelTitle}>
                <span>In progress</span>
                <strong>Your applications</strong>
              </div>
              <div className={styles.previewApplication}>
                <span className={styles.previewApplicationIcon}>A</span>
                <span>
                  <strong>Application submitted</strong>
                  <small>Project opportunity</small>
                </span>
                <em>Under review</em>
              </div>
            </div>

            <div className={styles.previewProfileCard}>
              <span>Professional profile</span>
              <strong>Show what you can do.</strong>
              <div className={styles.previewProgress}>
                <i />
              </div>
              <small>Skills · Resume · Work links</small>
            </div>
          </div>
        </div>
      </div>

      <figcaption>
        Sample content based on the current Indom student workspace.
      </figcaption>
    </figure>
  );
}

function ArrowIcon() {
  return (
    <svg className={styles.arrowIcon} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11m-4-4 4 4-4 4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <span className={styles.checkIcon} aria-hidden="true">
      <svg viewBox="0 0 20 20">
        <path d="m5 10 3 3 7-7" />
      </svg>
    </span>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M4 10h16M5 7h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    compass: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9z" />
      </>
    ),
    send: (
      <path d="m4 5 16-2-6 17-3-7-7-3Zm7 8 9-10" />
    ),
    status: (
      <>
        <path d="M7 5h10M7 9h10M7 13h7M5 3h14a1 1 0 0 1 1 1v16l-4-3H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 20c.8-4 3.3-6 7.5-6s6.7 2 7.5 6" />
      </>
    ),
  };

  return (
    <span className={styles.featureIcon} aria-hidden="true">
      <svg viewBox="0 0 24 24">{paths[name]}</svg>
    </span>
  );
}
