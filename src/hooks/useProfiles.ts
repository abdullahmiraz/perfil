import { useCallback, useEffect, useState } from "react";
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
  error: string | null;
  statusMessage: string;
  selectProfile: (profile: Profile) => void;
  updateDraft: (draft: ProfileData) => void;
  updateCustomFields: (fields: CustomField[]) => void;
  save: () => Promise<void>;
  addProfile: () => Promise<void>;
  removeProfile: () => Promise<void>;
  reload: () => Promise<void>;
}

export function useProfiles(enabled: boolean): UseProfilesResult {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState("");
  const [draft, setDraft] = useState<ProfileData | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const applyProfile = useCallback((profile: Profile) => {
    const migrated = migrateProfile(profile);
    setActiveId(migrated.id);
    setDraft({ ...migrated.data });
    setCustomFields([...migrated.customFields]);
    setStatusMessage("");
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
  }, [enabled, applyProfile]);

  useEffect(() => {
    void reload();
  }, [enabled]);

  const save = useCallback(async () => {
    if (!draft || !activeId) return;
    const profile = profiles.find((p) => p.id === activeId);
    if (!profile) return;
    try {
      const updated = await sendMessage({
        type: "SAVE_PROFILE",
        profile: {
          ...profile,
          data: draft,
          customFields,
          updatedAt: Date.now(),
        },
      });
      setStatusMessage("Saved");
      setProfiles((prev) =>
        prev.map((p) => (p.id === updated.profile.id ? migrateProfile(updated.profile) : p)),
      );
    } catch (e) {
      setError(toErrorMessage(e, "Save failed"));
    }
  }, [activeId, draft, customFields, profiles]);

  const addProfile = useCallback(async () => {
    try {
      const created = createProfile(`Profile ${profiles.length + 1}`);
      const { profile } = await sendMessage({ type: "SAVE_PROFILE", profile: created });
      const migrated = migrateProfile(profile);
      setProfiles((prev) => [...prev, migrated]);
      applyProfile(migrated);
    } catch (e) {
      setError(toErrorMessage(e, "Could not add profile"));
    }
  }, [profiles.length, applyProfile]);

  const removeProfile = useCallback(async () => {
    if (!activeId || profiles.length <= 1) return;
    try {
      await sendMessage({ type: "DELETE_PROFILE", profileId: activeId });
      setStatusMessage("Deleted");
      const remaining = profiles.filter((p) => p.id !== activeId);
      setProfiles(remaining);
      if (remaining[0]) applyProfile(remaining[0]);
    } catch (e) {
      setError(toErrorMessage(e, "Delete failed"));
    }
  }, [activeId, profiles, applyProfile]);

  return {
    profiles,
    activeId,
    draft,
    customFields,
    loading,
    error,
    statusMessage,
    selectProfile: applyProfile,
    updateDraft: setDraft,
    updateCustomFields: setCustomFields,
    save,
    addProfile,
    removeProfile,
    reload,
  };
}
