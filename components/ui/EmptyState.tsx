import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";
import stateStyles from "./State.module.css";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

const defaultIcon = (
  <svg viewBox="0 0 24 24">
    <path d="M5 7.5A1.5 1.5 0 0 1 6.5 6h11A1.5 1.5 0 0 1 19 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 16.5zM8 10h8M8 14h5" />
  </svg>
);

export function EmptyState({
  title,
  description,
  icon = defaultIcon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={[styles.empty, className].filter(Boolean).join(" ")}>
      <div className={styles.icon} aria-hidden="true">
        {icon}
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        {action && <div className={styles.action}>{action}</div>}
      </div>
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className={stateStyles.loadingState} role="status" aria-live="polite">
      <span className={stateStyles.loadingSpinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
