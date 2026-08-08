import type { ComponentProps } from "react";
import styles from "./Badge.module.css";

export type BadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

type BadgeProps = ComponentProps<"span"> & {
  tone?: BadgeTone;
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[styles.badge, styles[tone], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
