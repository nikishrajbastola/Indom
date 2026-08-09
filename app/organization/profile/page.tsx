"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import styles from "@/components/product/Product.module.css";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/EmptyState";
import formStyles from "@/components/ui/FormControls.module.css";
import { supabase } from "@/lib/supabase";

export default function OrganizationProfilePage() {
  const [organizationName, setOrganizationName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in to manage your organization profile.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("profiles")
      .select("full_name, website_url, industry, organization_description")
      .eq("id", user.id)
      .single();

    if (queryError) {
      setError("We couldn’t load your organization profile.");
    } else {
      setOrganizationName(data?.full_name || "");
      setWebsiteUrl(data?.website_url || "");
      setIndustry(data?.industry || "");
      setDescription(data?.organization_description || "");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadProfile]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      setError("Please log in before saving your profile.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: organizationName, website_url: websiteUrl, industry, organization_description: description })
      .eq("id", user.id);

    if (updateError) {
      setError("We couldn’t save your organization profile.");
    } else {
      setSuccess("Organization profile updated successfully.");
    }

    setSaving(false);
  };

  return (
    <AppShell workspace="organization">
      <div className={`${styles.page} ${styles.pageMedium}`}>
        <PageHeader
          eyebrow="Organization profile"
          title="Company identity"
          description="Give students clear context about who is posting projects and the work your organization does."
        />

        {error && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p>}
        {success && <p className={`${styles.notice} ${styles.noticeSuccess}`} role="status">{success}</p>}

        {loading ? (
          <LoadingState label="Loading organization profile" />
        ) : (
          <div className={styles.splitGrid}>
            <section className={styles.previewPanel} aria-labelledby="organization-preview-title">
              <p className={styles.sectionEyebrow}>Public profile preview</p>
              <div className={styles.profileHero}>
                <div className={styles.avatar} aria-hidden="true">{organizationName.charAt(0).toUpperCase() || "O"}</div>
                <div>
                  <h2 id="organization-preview-title">{organizationName || "Organization name"}</h2>
                  <p>{industry || "Industry or focus area"}</p>
                </div>
              </div>
              <p className={styles.profileBody}>{description || "Add a short description so students understand what your organization does."}</p>
              {websiteUrl && <div className={styles.profileLinks}><a href={websiteUrl} target="_blank" rel="noreferrer">Visit website →</a></div>}
            </section>

            <form className={styles.formPanel} onSubmit={saveProfile}>
              <section className={styles.subsection} aria-labelledby="organization-details-title">
                <h2 id="organization-details-title">Organization details</h2>
                <p>Keep this information accurate and useful for students reviewing your opportunities.</p>
                <div className={formStyles.form}>
                  <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="organization-name">Organization name</label>
                    <input id="organization-name" className={formStyles.input} required value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="organization-website">Website</label>
                    <input id="organization-website" className={formStyles.input} type="url" placeholder="https://example.com" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="organization-industry">Industry or focus</label>
                    <input id="organization-industry" className={formStyles.input} placeholder="Education, research, nonprofit, startup" value={industry} onChange={(event) => setIndustry(event.target.value)} />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="organization-description">Description</label>
                    <textarea id="organization-description" className={formStyles.textarea} placeholder="Describe your organization and the kinds of projects you post." value={description} onChange={(event) => setDescription(event.target.value)} />
                  </div>
                </div>
              </section>
              <div className={formStyles.actions}>
                <Button type="submit" loading={saving}>{saving ? "Saving…" : "Save profile"}</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}
