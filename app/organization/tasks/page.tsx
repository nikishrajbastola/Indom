"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField, Textarea, TextInput } from "@/components/ui/FormControls";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { supabase } from "@/lib/supabase";

type Task = { id: string; title: string; description: string; skills: string | null; duration: string | null };

export default function OrganizationTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in to view projects.");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("tasks").select("id, title, description, skills, duration").eq("organization_id", user.id).order("created_at", { ascending: false });
    if (error) setErrorMessage(error.message);
    else setTasks(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void fetchTasks(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [fetchTasks]);

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this project?")) return;
    setErrorMessage("");
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) setErrorMessage(error.message);
    else setTasks((current) => current.filter((task) => task.id !== taskId));
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTitle(task.title);
    setEditedDescription(task.description);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditedTitle("");
    setEditedDescription("");
  };

  const saveTask = async (taskId: string) => {
    setSaving(true);
    setErrorMessage("");
    const { error } = await supabase.from("tasks").update({ title: editedTitle, description: editedDescription }).eq("id", taskId);
    if (error) setErrorMessage(error.message);
    else {
      setTasks((current) => current.map((task) => task.id === taskId ? { ...task, title: editedTitle, description: editedDescription } : task));
      cancelEditing();
    }
    setSaving(false);
  };

  return (
    <div className={workspace.page}>
      <div className={workspace.headerGap}>
        <PageHeader eyebrow="Organization projects" title="Projects" description="Maintain the opportunities published by your organization." action={<ButtonLink href="/organization/post-task">Post project</ButtonLink>} />
      </div>
      {errorMessage && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{errorMessage}</p>}
      {loading ? (
        <div className={workspace.grid}>{Array.from({ length: 4 }).map((_, index) => <Card key={index}><Skeleton style={{ width: "55%", height: 24 }} /><Skeleton style={{ width: "100%", height: 80, marginTop: 18 }} /></Card>)}</div>
      ) : tasks.length === 0 ? (
        <EmptyState title="No projects posted" description="Create your first opportunity to begin receiving student applications." action={<ButtonLink href="/organization/post-task">Post a project</ButtonLink>} />
      ) : (
        <div className={workspace.grid}>
          {tasks.map((task) => (
            <Card key={task.id} className={workspace.card}>
              {editingTaskId === task.id ? (
                <div className={workspace.form}>
                  <FormField label="Project title" htmlFor={`title-${task.id}`}><TextInput id={`title-${task.id}`} value={editedTitle} onChange={(event) => setEditedTitle(event.target.value)} /></FormField>
                  <FormField label="Description" htmlFor={`description-${task.id}`}><Textarea id={`description-${task.id}`} value={editedDescription} onChange={(event) => setEditedDescription(event.target.value)} /></FormField>
                  <div className={workspace.actions}><Button onClick={() => void saveTask(task.id)} disabled={saving}>{saving ? "Saving…" : "Save"}</Button><Button variant="secondary" onClick={cancelEditing}>Cancel</Button></div>
                </div>
              ) : (
                <>
                  <div><h2 className={workspace.cardTitle}>{task.title}</h2><p className={workspace.description}>{task.description}</p></div>
                  <div className={workspace.badges}><Badge>{task.skills || "Skills not listed"}</Badge><Badge>{task.duration || "Duration not listed"}</Badge></div>
                  <div className={`${workspace.actions} ${workspace.spacer}`}><Button variant="secondary" size="small" onClick={() => startEditing(task)}>Edit</Button><Button variant="danger" size="small" onClick={() => void handleDelete(task.id)}>Delete</Button></div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
