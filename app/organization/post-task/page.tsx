"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import styles from "@/components/product/Product.module.css";
import { Button } from "@/components/ui/Button";
import formStyles from "@/components/ui/FormControls.module.css";
import { supabase } from "@/lib/supabase";

export default function PostTaskPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [duration, setDuration] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePostTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in before posting a project.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("tasks").insert([
      { title, description, skills, duration, organization_id: user.id },
    ]);

    if (insertError) {
      setError("We couldn’t publish this project. Please try again.");
      setSubmitting(false);
      return;
    }

    setTitle("");
    setDescription("");
    setSkills("");
    setDuration("");
    setSuccess("Project published successfully.");
    setSubmitting(false);
  };

  return (
    <AppShell workspace="organization">
      <div className={`${styles.page} ${styles.pageNarrow}`}>
        <PageHeader
          eyebrow="New opportunity"
          title="Post a project"
          description="Create a clear, scoped opportunity so students understand the work and what they can contribute."
        />

        {error && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p>}
        {success && <p className={`${styles.notice} ${styles.noticeSuccess}`} role="status">{success}</p>}

        <form className={styles.formPanel} onSubmit={handlePostTask}>
          <section className={styles.subsection} aria-labelledby="project-basics-title">
            <h2 id="project-basics-title">Project basics</h2>
            <p>Use a direct title and explain the outcome students will help create.</p>
            <div className={formStyles.form}>
              <div className={formStyles.field}>
                <label className={formStyles.label} htmlFor="project-title">Project title</label>
                <input
                  id="project-title"
                  className={formStyles.input}
                  placeholder="Example: Clean research survey data"
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>

              <div className={formStyles.field}>
                <label className={formStyles.label} htmlFor="project-description">Description</label>
                <textarea
                  id="project-description"
                  className={formStyles.textarea}
                  placeholder="Describe the work, expected outcome, and any important requirements."
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <p className={formStyles.help}>Be specific about what the student will work on and what a useful result looks like.</p>
              </div>
            </div>
          </section>

          <section className={styles.subsection} aria-labelledby="project-details-title">
            <h2 id="project-details-title">Skills and timing</h2>
            <p>These fields use the existing project schema.</p>
            <div className={formStyles.formGrid}>
              <div className={formStyles.field}>
                <label className={formStyles.label} htmlFor="project-skills">Skills needed</label>
                <input
                  id="project-skills"
                  className={formStyles.input}
                  placeholder="Excel, Python, research"
                  value={skills}
                  onChange={(event) => setSkills(event.target.value)}
                />
                <p className={formStyles.help}>Separate skills with commas.</p>
              </div>

              <div className={formStyles.field}>
                <label className={formStyles.label} htmlFor="project-duration">Estimated duration</label>
                <input
                  id="project-duration"
                  className={formStyles.input}
                  placeholder="Example: 2 weeks"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                />
              </div>
            </div>
          </section>

          <div className={formStyles.actions}>
            <Button type="submit" loading={submitting}>
              {submitting ? "Publishing…" : "Publish project"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
