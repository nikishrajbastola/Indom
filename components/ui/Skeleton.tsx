import type { ComponentProps } from "react";
import styles from "./Skeleton.module.css";

export function Skeleton({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={[styles.skeleton, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
