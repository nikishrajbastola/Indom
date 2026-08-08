"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField, Textarea, TextInput } from "@/components/ui/FormControls";
import { Skeleton } from "@/components/ui/Skeleton";
import workspace from "@/components/ui/Workspace.module.css";
import { supabase } from "@/lib/supabase";

export default function OrganizationProfilePage() {
  const [organizationName, setOrganizationName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in to view your organization profile.");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("profiles").select("full_name, website_url, industry, organization_description").eq("id", user.id).single();
    if (error) setErrorMessage(error.message);
    else {
      setOrganizationName(data?.full_name || "");
      setWebsiteUrl(data?.website_url || "");
      setIndustry(data?.industry || "");
      setDescription(data?.organization_description || "");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void fetchProfile(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [fetchProfile]);

  const saveProfile = async () => {
    setSaving(true);
    setErrorMessage("");
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You must be logged in.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("profiles").update({ full_name: organizationName, website_url: websiteUrl, industry, organization_description: description }).eq("id", user.id);
    if (error) setErrorMessage(error.message);
    else setMessage("Organization profile saved.");
    setSaving(false);
  };

  return (
    <div className={`${workspace.page} ${workspace.narrowPage}`}>
      <div className={workspace.headerGap}><PageHeader eyebrow="Organization profile" title="Company identity" description="Help students understand your organization and the work you offer." /></div>
      {errorMessage && <p className={`${workspace.notice} ${workspace.noticeDanger}`} role="alert">{errorMessage}</p>}
      {message && <p className={`${workspace.notice} ${workspace.noticeSuccess}`} role="status">{message}</p>}
      {loading ? (
        <div className={workspace.twoColumn}><Card><Skeleton style={{ width: "65%", height: 28 }} /><Skeleton style={{ width: "100%", height: 160, marginTop: 20 }} /></Card><Card><Skeleton style={{ width: "100%", height: 320 }} /></Card></div>
      ) : (
        <div className={workspace.twoColumn}>
          <Card className={workspace.card}>
            <div className={workspace.cardHeader}><p className={workspace.eyebrow}>Student-facing preview</p>{industry && <Badge>{industry}</Badge>}</div>
            <div><h2 className={workspace.sectionTitle}>{organizationName || "Organization name"}</h2><p className={workspace.description}>{description || "Add a concise description of your organization and the projects you publish."}</p></div>
            {websiteUrl && <a className={workspace.link} href={websiteUrl} target="_blank" rel="noreferrer">Visit website</a>}
          </Card>
          <Card>
            <div className={workspace.form}>
              <FormField label="Organization name" htmlFor="organization-name"><TextInput id="organization-name" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Texas State AI Club" /></FormField>
              <FormField label="Website" htmlFor="website"><TextInput id="website" type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://example.com" /></FormField>
              <FormField label="Industry or focus" htmlFor="industry"><TextInput id="industry" value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder="Education, AI, nonprofit…" /></FormField>
              <FormField label="Description" htmlFor="organization-description"><Textarea id="organization-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe your organization and the opportunities you offer." /></FormField>
              <Button onClick={() => void saveProfile()} disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
