import type { ComponentProps, ReactNode } from "react";
import styles from "./FormControls.module.css";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  description?: string;
  error?: string;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  description,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor}>{label}</label>
      {description && <p className={styles.description}>{description}</p>}
      {children}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={[styles.control, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      className={[styles.control, styles.textarea, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={[styles.control, styles.select, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function FileInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      type="file"
      className={[styles.control, styles.file, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
