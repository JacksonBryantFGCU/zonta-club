// zonta-site/src/pages/Admin/Settings.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SettingsState } from "../../queries/settingsTypes";

async function fetchSettings(): Promise<SettingsState> {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/settings`,
    {
      headers: { Authorization: `Bearer ${token ?? ""}` },
    }
  );
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

async function updateSettings(updated: SettingsState): Promise<SettingsState> {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/settings`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify(updated),
    }
  );
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}

export default function Settings() {
  const queryClient = useQueryClient();
  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const [status, setStatus] = useState("");
  const [draft, setDraft] = useState<SettingsState | null>(null);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["publicSettings"] });
      queryClient.refetchQueries({ queryKey: ["publicSettings"] });
      setStatus("Settings saved - changes will appear immediately");
      setTimeout(() => setStatus(""), 3000);
    },
    onError: (error: Error) => {
      console.error("Save settings error:", error);
      setStatus(`Failed to save settings: ${error.message}`);
    },
  });

  if (draft === null && settings) {
    setDraft(settings);
  }

  if (isLoading) return <p>Loading settings...</p>;
  if (isError || !settings) return <p>Failed to load settings.</p>;
  if (!draft) return <p>Loading settings...</p>;

  const toggle = (section: keyof SettingsState, key: string, value: unknown) =>
    setDraft((prev) => {
      if (!prev) return null;
      const currentSection = prev[section];
      if (typeof currentSection !== "object" || Array.isArray(currentSection))
        return prev;
      return {
        ...prev,
        [section]: { ...currentSection, [key]: value },
      };
    });

  const handleSave = () => mutation.mutate(draft);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zontaRed">Site Settings</h1>
          <p className="text-sm text-gray-600">
            Manage backend features and site-wide notices.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="px-4 py-2 bg-zontaGold text-white rounded-md shadow hover:bg-zontaRed transition text-sm font-medium disabled:opacity-60"
        >
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </header>

      {status && <p className="text-sm text-zontaRed">{status}</p>}

      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zontaRed">
          Maintenance Mode
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Enable this to temporarily disable the public site with a notice.
        </p>

        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={draft.maintenance.enabled}
            onChange={(e) => toggle("maintenance", "enabled", e.target.checked)}
            className="h-4 w-4 text-zontaGold rounded border-gray-300"
          />
          Enable Maintenance Mode
        </label>

        <textarea
          className="w-full border border-gray-300 rounded-md text-sm p-2 focus:ring-2 focus:ring-zontaGold"
          placeholder="Maintenance message"
          value={draft.maintenance.message}
          onChange={(e) => toggle("maintenance", "message", e.target.value)}
        />
      </section>

      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zontaRed">
          Homepage Announcement
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Display a short announcement banner on the homepage.
        </p>

        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={draft.announcement.enabled}
            onChange={(e) =>
              toggle("announcement", "enabled", e.target.checked)
            }
            className="h-4 w-4 text-zontaGold rounded border-gray-300"
          />
          Show Banner
        </label>

        <input
          type="text"
          placeholder="Banner text"
          className="input border-gray-300 rounded-md px-3 py-2 text-sm w-full mb-2"
          value={draft.announcement.text}
          onChange={(e) => toggle("announcement", "text", e.target.value)}
        />

        <input
          type="url"
          placeholder="Optional link (https://...)"
          className="input border-gray-300 rounded-md px-3 py-2 text-sm w-full"
          value={draft.announcement.link}
          onChange={(e) => toggle("announcement", "link", e.target.value)}
        />
      </section>

      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zontaRed">Feature Toggles</h2>
        <p className="text-sm text-gray-600 mb-3">
          Control which backend features are currently active.
        </p>

        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={draft.features.donationsEnabled}
            onChange={(e) =>
              toggle("features", "donationsEnabled", e.target.checked)
            }
            className="h-4 w-4 text-zontaGold rounded border-gray-300"
          />
          Enable Donations
        </label>
      </section>

      {status && <p className="text-sm text-zontaRed">{status}</p>}
    </div>
  );
}
