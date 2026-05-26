import { useCallback, useEffect, useState } from "react";
import { duplicateCustomField } from "@/lib/custom-field";
import { createProfile } from "@/lib/profile-defaults";
import { migrateProfile } from "@/lib/profile-migrate";
import { toErrorMessage } from "@/shared/errors";
import { sendMessage } from "@/shared/messages";
import type { CustomField, Profile, ProfileData } from "@/types/profile";

export interface UseProfilesResult {
  profiles: Profile[];
  activeId: string;
  draft: ProfileData | null;
  customFields: CustomField[];
  loading: boolean;
  saving: boolean;
  adding: boolean;
  error: string | null;
  statusMessage: string;
  selectProfile: (profile: Profile) => void;
  updateDraft: (draft: ProfileData) => void;
  updateCustomFields: (fields: CustomField[]) => void;
  save: () => Promise<boolean>;
  addProfile: () => Promise<void>;
  duplicateProfile: () => Promise<void>;
  removeProfile: () => Promise<boolean>;
  reload: () => Promise<void>;
  clearStatus: () => void;
}

function syncFromProfile(
  profile: Profile,
  setters: {
    setActiveId: (id: string) => void;
    setDraft: (d: ProfileData) => void;
    setCustomFields: (f: CustomField[]) => void;
  },
): void {
  const migrated = migrateProfile(profile);
  setters.setActiveId(migrated.id);
  setters.setDraft({ ...migrated.data });
  setters.setCustomFields([...migrated.customFields]);
}

export function useProfiles(enabled: boolean): UseProfilesResult {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState("");
  const [draft, setDraft] = useState<ProfileData | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const applyProfile = useCallback((profile: Profile) => {
    syncFromProfile(profile, { setActiveId, setDraft, setCustomFields });
    setError(null);
  }, []);

  const reload = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { profiles: list } = await sendMessage({ type: "GET_PROFILES" });
      const migrated = list.map(migrateProfile);
      setProfiles(migrated);
      const current = migrated.find((p) => p.id === activeId) ?? migrated[0];
      if (current) applyProfile(current);
      else {
        setDraft(null);
        setCustomFields([]);
      }
    } catch (e) {
      setError(toErrorMessage(e, "Failed to load profiles"));
    } finally {
      setLoading(false);
    }
  }, [enabled, activeId, applyProfile]);

  useEffect(() => {
    void reload();
  }, [enabled]);

  const save = useCallback(async (): Promise<boolean> => {
    if (!draft || !activeId) return false;
    const profile = profiles.find((p) => p.id === activeId);
    if (!profile) return false;
    setSaving(true);
    setError(null);
    try {
      const { profile: saved } = await sendMessage({
        type: "SAVE_PROFILE",
        profile: {
          ...profile,
          data: draft,
          customFields,
          updatedAt: Date.now(),
        },
      });
      const migrated = migrateProfile(saved);
      setProfiles((prev) => prev.map((p) => (p.id === migrated.id ? migrated : p)));
      syncFromProfile(migrated, { setActiveId, setDraft, setCustomFields });
      setStatusMessage("Saved");
      return true;
    } catch (e) {
      setError(toErrorMessage(e, "Save failed"));
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeId, draft, customFields, profiles]);

  const addProfile = useCallback(async () => {
    setAdding(true);
    setError(null);
    try {
      const created = createProfile(`Profile ${profiles.length + 1}`);
      const { profile } = await sendMessage({ type: "SAVE_PROFILE", profile: created });
      const migrated = migrateProfile(profile);
      setProfiles((prev) => [...prev, migrated]);
      applyProfile(migrated);
      setStatusMessage("Profile created");
    } catch (e) {
      setError(toErrorMessage(e, "Could not add profile"));
    } finally {
      setAdding(false);
    }
  }, [profiles.length, applyProfile]);

  const duplicateProfile = useCallback(async () => {
    if (!draft || !activeId) return;
    const source = profiles.find((p) => p.id === activeId);
    if (!source) return;
    setAdding(true);
    setError(null);
    try {
      const baseLabel = draft.label?.trim() || "Profile";
      const created = createProfile(`${baseLabel} (copy)`, {
        ...draft,
        label: `${baseLabel} (copy)`,
      });
      created.customFields = source.customFields.map(duplicateCustomField);
      const { profile } = await sendMessage({ type: "SAVE_PROFILE", profile: created });
      const migrated = migrateProfile(profile);
      setProfiles((prev) => [...prev, migrated]);
      applyProfile(migrated);
      setStatusMessage("Profile duplicated");
    } catch (e) {
      setError(toErrorMessage(e, "Could not duplicate profile"));
    } finally {
      setAdding(false);
    }
  }, [activeId, draft, profiles, applyProfile]);

  const removeProfile = useCallback(async (): Promise<boolean> => {
    if (!activeId || profiles.length <= 1) return false;
    setSaving(true);
    try {
      await sendMessage({ type: "DELETE_PROFILE", profileId: activeId });
      const remaining = profiles.filter((p) => p.id !== activeId);
      setProfiles(remaining);
      if (remaining[0]) applyProfile(remaining[0]);
      setStatusMessage("Profile deleted");
      return true;
    } catch (e) {
      setError(toErrorMessage(e, "Delete failed"));
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeId, profiles, applyProfile]);

  return {
    profiles,
    activeId,
    draft,
    customFields,
    loading,
    saving,
    adding,
    error,
    statusMessage,
    selectProfile: applyProfile,
    updateDraft: setDraft,
    updateCustomFields: setCustomFields,
    save,
    addProfile,
    duplicateProfile,
    removeProfile,
    reload,
    clearStatus: () => setStatusMessage(""),
  };
}
