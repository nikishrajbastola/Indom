import type { ComponentProps } from "react";
import styles from "./Badge.module.css";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={[styles.badge, styles[tone], className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
