import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SettingsState } from "./settingsTypes";

async function fetchSettings(): Promise<SettingsState> {
  const token = localStorage.getItem("adminToken");

  const res = await fetch("/api/admin/settings", {
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load settings");
  }

  return res.json();
}

async function saveSettings(updated: SettingsState): Promise<SettingsState> {
  const token = localStorage.getItem("adminToken");

  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ?? ""}`,
    },
    body: JSON.stringify(updated),
  });

  if (!res.ok) {
    throw new Error("Failed to save settings");
  }

  return res.json();
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });
}

export function useSaveSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      // refetch so UI has the latest that was actually stored
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}