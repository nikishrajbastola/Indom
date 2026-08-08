import type { ComponentProps } from "react";
import styles from "./Card.module.css";

type CardProps = ComponentProps<"div"> & {
  padding?: "compact" | "default";
};

export function Card({
  padding = "default",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={[styles.card, styles[padding], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
