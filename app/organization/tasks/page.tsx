"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import styles from "@/components/product/Product.module.css";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import formStyles from "@/components/ui/FormControls.module.css";
import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  title: string;
  description: string;
  skills: string | null;
  duration: string | null;
};

export default function OrganizationTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in to manage your projects.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("tasks")
      .select("id, title, description, skills, duration")
      .eq("organization_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError("We couldn’t load your projects. Please try again.");
    } else {
      setTasks(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadTasks(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadTasks]);

  const handleDelete = async (taskId: string) => {
    const confirmed = window.confirm("Delete this project? This action cannot be undone.");
    if (!confirmed) return;

    setError("");
    setSuccess("");
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", taskId);

    if (deleteError) {
      setError("We couldn’t delete this project.");
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== taskId));
    setSuccess("Project deleted.");
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setError("");
    setSuccess("");
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditedTitle("");
    setEditedDescription("");
  };

  const saveTask = async (taskId: string) => {
    setSaving(true);
    setError("");
    setSuccess("");
    const { error: updateError } = await supabase
      .from("tasks")
      .update({ title: editedTitle, description: editedDescription })
      .eq("id", taskId);

    if (updateError) {
      setError("We couldn’t save your changes.");
      setSaving(false);
      return;
    }

    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, title: editedTitle, description: editedDescription } : task));
    cancelEditing();
    setSuccess("Project updated successfully.");
    setSaving(false);
  };

  return (
    <AppShell workspace="organization">
      <div className={styles.page}>
        <PageHeader
          eyebrow="Project management"
          title="Your projects"
          description="Review and update the opportunities your organization has posted."
          action={<ButtonLink href="/organization/post-task">Post project →</ButtonLink>}
        />

        {error && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p>}
        {success && <p className={`${styles.notice} ${styles.noticeSuccess}`} role="status">{success}</p>}

        {loading ? (
          <LoadingState label="Loading projects" />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No projects posted yet"
            description="Create a focused opportunity to start receiving student applications."
            action={<ButtonLink href="/organization/post-task">Post a project</ButtonLink>}
          />
        ) : (
          <section className={styles.cardsGrid} aria-label="Posted projects">
            {tasks.map((task) => (
              <article key={task.id} className={styles.projectCard}>
                {editingTaskId === task.id ? (
                  <div className={formStyles.form}>
                    <div className={formStyles.field}>
                      <label className={formStyles.label} htmlFor={`title-${task.id}`}>Project title</label>
                      <input id={`title-${task.id}`} className={formStyles.input} value={editedTitle} onChange={(event) => setEditedTitle(event.target.value)} />
                    </div>
                    <div className={formStyles.field}>
                      <label className={formStyles.label} htmlFor={`description-${task.id}`}>Description</label>
                      <textarea id={`description-${task.id}`} className={formStyles.textarea} value={editedDescription} onChange={(event) => setEditedDescription(event.target.value)} />
                    </div>
                    <div className={styles.cardActions}>
                      <Button variant="secondary" size="small" onClick={cancelEditing}>Cancel</Button>
                      <Button size="small" onClick={() => saveTask(task.id)} loading={saving}>{saving ? "Saving…" : "Save changes"}</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className={styles.cardEyebrow}>Posted project</p>
                      <h2>{task.title}</h2>
                      <p className={styles.description}>{task.description}</p>
                      <div className={styles.chips}>
                        <span className={styles.chip}>{task.skills || "Skills not listed"}</span>
                        <span className={styles.chip}>{task.duration || "Duration not listed"}</span>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <Button variant="secondary" size="small" onClick={() => startEditing(task)}>Edit project</Button>
                      <Button variant="danger" size="small" onClick={() => handleDelete(task.id)}>Delete</Button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </AppShell>
  );
}
