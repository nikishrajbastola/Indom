import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./StudentDashboardCards.module.css";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  loading: boolean;
  href: string;
  linkLabel: string;
};

export function StatCard({
  icon,
  label,
  value,
  loading,
  href,
  linkLabel,
}: StatCardProps) {
  return (
    <Card padding="compact" className={styles.statCard}>
      <div className={styles.statHeading}>
        <span className={styles.statIcon} aria-hidden="true">
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {loading ? (
        <Skeleton className={styles.skeletonNumber} aria-label={`Loading ${label}`} />
      ) : (
        <strong>{value}</strong>
      )}
      <Link href={href} className={styles.textLink}>
        {linkLabel} <span aria-hidden="true">→</span>
      </Link>
    </Card>
  );
}

type ApplicationRowProps = {
  title: string;
  organization: string;
  status: string;
  statusTone: BadgeTone;
  dateLabel: string;
  dateTime?: string;
};

export function ApplicationRow({
  title,
  organization,
  status,
  statusTone,
  dateLabel,
  dateTime,
}: ApplicationRowProps) {
  return (
    <article className={styles.applicationRow}>
      <div className={styles.applicationInfo}>
        <h3>{title}</h3>
        <p>{organization}</p>
      </div>
      <div className={styles.applicationMeta}>
        <Badge tone={statusTone}>{status}</Badge>
        <time dateTime={dateTime}>{dateLabel}</time>
      </div>
    </article>
  );
}

export function LoadingApplicationRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className={styles.applicationList} aria-label="Loading applications" role="status">
      {Array.from({ length: rows }).map((_, index) => (
        <div className={styles.applicationRow} key={index}>
          <div>
            <Skeleton className={styles.skeletonTitle} />
            <Skeleton className={styles.skeletonMeta} />
          </div>
          <Skeleton className={styles.skeletonBadge} />
        </div>
      ))}
    </div>
  );
}

type InlineErrorProps = {
  message: string;
  onRetry: () => void;
};

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className={styles.inlineError} role="status">
      <span className={styles.errorIcon} aria-hidden="true">
        !
      </span>
      <div>
        <p>{message}</p>
        <Button variant="ghost" size="small" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

type ProfileStrengthCardProps = {
  loading: boolean;
  error: boolean;
  completed: number;
  total: number;
  percentage: number;
  onRetry: () => void;
};

export function ProfileStrengthCard({
  loading,
  error,
  completed,
  total,
  percentage,
  onRetry,
}: ProfileStrengthCardProps) {
  return (
    <Card className={styles.profileCard}>
      <div className={styles.profileHeader}>
        <div>
          <p className={styles.eyebrow}>Profile strength</p>
          <h2>Stand out to organizations</h2>
        </div>
        {!loading && !error && (
          <span className={styles.profilePercentage}>{percentage}%</span>
        )}
      </div>

      {loading ? (
        <div className={styles.profileSkeleton} role="status" aria-label="Loading profile">
          <Skeleton className={styles.skeletonLine} />
          <Skeleton className={styles.skeletonLineShort} />
        </div>
      ) : error ? (
        <InlineError message="We couldn't load your profile." onRetry={onRetry} />
      ) : (
        <>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label="Profile completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
          >
            <span style={{ width: `${percentage}%` }} />
          </div>
          <p className={styles.profileDescription}>
            {completed === total
              ? "Your profile is complete and ready to share."
              : `${completed} of ${total} profile details complete. Add the missing details to help organizations understand your experience.`}
          </p>
          <ButtonLink
            href="/student/profile"
            variant="secondary"
            className={styles.profileAction}
          >
            {completed === total ? "Review profile" : "Complete profile"}
          </ButtonLink>
        </>
      )}
    </Card>
  );
}

type ProjectCardProps = {
  href: string;
  title: string;
  organization: string;
  description: string;
  skills: string[];
  duration: string;
};

export function ProjectCard({
  href,
  title,
  organization,
  description,
  skills,
  duration,
}: ProjectCardProps) {
  return (
    <Link href={href} className={styles.projectCard} aria-label={`Explore ${title}`}>
      <div>
        <p className={styles.organizationName}>{organization}</p>
        <h3>{title}</h3>
        <p className={styles.projectDescription}>{description}</p>
      </div>

      <div>
        {skills.length > 0 && (
          <div className={styles.tagList} aria-label="Skills">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        )}
        <div className={styles.projectFooter}>
          <span>{duration}</span>
          <span className={styles.cardArrow} aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className={styles.projectSkeleton} aria-hidden="true">
      <Skeleton className={styles.skeletonMeta} />
      <Skeleton className={styles.skeletonProjectTitle} />
      <Skeleton className={styles.skeletonLine} />
      <Skeleton className={styles.skeletonLineShort} />
    </div>
  );
}
