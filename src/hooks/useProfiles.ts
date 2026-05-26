import { useCallback, useEffect, useState } from "react";
import { createProfile } from "@/lib/profile-defaults";
import { toErrorMessage } from "@/shared/errors";
import { sendMessage } from "@/shared/messages";
import type { Profile, ProfileData } from "@/types/profile";

export interface UseProfilesResult {
  profiles: Profile[];
  activeId: string;
  draft: ProfileData | null;
  loading: boolean;
  error: string | null;
  statusMessage: string;
  selectProfile: (profile: Profile) => void;
  updateDraft: (draft: ProfileData) => void;
  save: () => Promise<void>;
  addProfile: () => Promise<void>;
  removeProfile: () => Promise<void>;
  reload: () => Promise<void>;
}

export function useProfiles(enabled: boolean): UseProfilesResult {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState("");
  const [draft, setDraft] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const selectProfile = useCallback((profile: Profile) => {
    setActiveId(profile.id);
    setDraft({ ...profile.data });
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
      setProfiles(list);
      setActiveId((prev) => {
        const current = list.find((p) => p.id === prev) ?? list[0];
        if (current) {
          setDraft({ ...current.data });
          return current.id;
        }
        setDraft(null);
        return "";
      });
    } catch (e) {
      setError(toErrorMessage(e, "Failed to load profiles"));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(async () => {
    if (!draft || !activeId) return;
    const profile = profiles.find((p) => p.id === activeId);
    if (!profile) return;
    try {
      const updated = await sendMessage({
        type: "SAVE_PROFILE",
        profile: { ...profile, data: draft, updatedAt: Date.now() },
      });
      setStatusMessage("Saved");
      setProfiles((prev) =>
        prev.map((p) => (p.id === updated.profile.id ? updated.profile : p)),
      );
    } catch (e) {
      setError(toErrorMessage(e, "Save failed"));
    }
  }, [activeId, draft, profiles]);

  const addProfile = useCallback(async () => {
    try {
      const created = createProfile(`Profile ${profiles.length + 1}`);
      const { profile } = await sendMessage({ type: "SAVE_PROFILE", profile: created });
      setProfiles((prev) => [...prev, profile]);
      selectProfile(profile);
    } catch (e) {
      setError(toErrorMessage(e, "Could not add profile"));
    }
  }, [profiles.length, selectProfile]);

  const removeProfile = useCallback(async () => {
    if (!activeId || profiles.length <= 1) return;
    try {
      await sendMessage({ type: "DELETE_PROFILE", profileId: activeId });
      setStatusMessage("Deleted");
      const remaining = profiles.filter((p) => p.id !== activeId);
      setProfiles(remaining);
      if (remaining[0]) selectProfile(remaining[0]);
    } catch (e) {
      setError(toErrorMessage(e, "Delete failed"));
    }
  }, [activeId, profiles, selectProfile]);

  return {
    profiles,
    activeId,
    draft,
    loading,
    error,
    statusMessage,
    selectProfile,
    updateDraft: setDraft,
    save,
    addProfile,
    removeProfile,
    reload,
  };
}
