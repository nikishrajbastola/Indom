import type { ReactNode } from "react";
import styles from "./State.module.css";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5 7.5A1.5 1.5 0 0 1 6.5 6h11A1.5 1.5 0 0 1 19 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 16.5zM8 10h8M8 14h5" />
        </svg>
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action && <div className={styles.stateAction}>{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className={styles.loadingState} role="status" aria-live="polite">
      <span className={styles.loadingSpinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
