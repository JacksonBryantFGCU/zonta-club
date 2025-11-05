import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SettingsState, FeatureToggles } from "../../queries/settingsTypes";

// ========================
// 📡 API Helpers
// ========================
async function fetchSettings(): Promise<SettingsState> {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/settings`, {
    headers: { Authorization: `Bearer ${token ?? ""}` },
  });
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

async function updateSettings(updated: SettingsState): Promise<SettingsState> {
  const token = localStorage.getItem("adminToken");
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ?? ""}`,
    },
    body: JSON.stringify(updated),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}

// ========================
// 🧠 React Component
// ========================
export default function Settings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      // Invalidate both admin settings and public settings queries
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["publicSettings"] });
      
      // Force immediate refetch of public settings
      queryClient.refetchQueries({ queryKey: ["publicSettings"] });
      
      setStatus("✅ Settings saved - changes will appear immediately");
      setTimeout(() => setStatus(""), 3000);
    },
    onError: (error: Error) => {
      console.error("❌ Save settings error:", error);
      setStatus(`❌ Failed to save settings: ${error.message}`);
    },
  });

  const [status, setStatus] = useState("");
  const [draft, setDraft] = useState<SettingsState | null>(null);

  // Initialize draft when settings load
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
      if (typeof currentSection !== 'object' || Array.isArray(currentSection)) return prev;
      return {
        ...prev,
        [section]: { ...currentSection, [key]: value },
      };
    });

  const updateAdmin = (id: string, key: string, value: unknown) =>
    setDraft((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        admins: prev.admins.map((a) =>
          a.id === id ? { ...a, [key]: value } : a
        ),
      };
    });

  const handleSave = () => mutation.mutate(draft);

  // Check if logged-in admin is the president (has full access)
  const loggedInEmail = localStorage.getItem("adminEmail");
  const isPresident = loggedInEmail === "jackbryant5589@gmail.com";

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zontaRed">Site Settings</h1>
          <p className="text-sm text-gray-600">
            Manage backend features and admin access. These settings do not
            affect the public site design.
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

      {/* Maintenance */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zontaRed">Maintenance Mode</h2>
        <p className="text-sm text-gray-600 mb-3">
          Enable this to temporarily disable the public site with a notice.
        </p>

        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={draft.maintenance.enabled}
            onChange={(e) =>
              toggle("maintenance", "enabled", e.target.checked)
            }
            className="h-4 w-4 text-zontaGold rounded border-gray-300"
          />
          Enable Maintenance Mode
        </label>

        <textarea
          className="w-full border border-gray-300 rounded-md text-sm p-2 focus:ring-2 focus:ring-zontaGold"
          placeholder="Maintenance message"
          value={draft.maintenance.message}
          onChange={(e) =>
            toggle("maintenance", "message", e.target.value)
          }
        />
      </section>

      {/* Announcement */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zontaRed">Homepage Announcement</h2>
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

      {/* Features */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-zontaRed">Feature Toggles</h2>
        <p className="text-sm text-gray-600 mb-3">
          Control which backend features are currently active.
        </p>

        {[
          { key: "shopEnabled", label: "Enable Shop" },
          { key: "donationsEnabled", label: "Enable Donations" },
        ].map((f) => (
          <label key={f.key} className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={draft.features[f.key as keyof FeatureToggles]}
              onChange={(e) =>
                toggle("features", f.key, e.target.checked)
              }
              className="h-4 w-4 text-zontaGold rounded border-gray-300"
            />
            {f.label}
          </label>
        ))}
      </section>

      {/* Admin Access */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-zontaRed mb-3">Admin Access</h2>
        <p className="text-sm text-gray-600 mb-4">
          Manage admin account roles and access. Only the Club President can
          modify roles or deactivate accounts.
        </p>

        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="py-2 px-3 text-left font-medium">Name</th>
              <th className="py-2 px-3 text-left font-medium">Email</th>
              <th className="py-2 px-3 text-left font-medium">Role</th>
              <th className="py-2 px-3 text-left font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {draft.admins.map((a) => (
              <tr key={a.id} className="border-t border-gray-200">
                <td className="py-2 px-3">{a.name}</td>
                <td className="py-2 px-3">{a.email}</td>
                <td className="py-2 px-3">
                  <select
                    value={a.role}
                    onChange={(e) =>
                      updateAdmin(a.id, "role", e.target.value)
                    }
                    disabled={!isPresident}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-zontaGold disabled:bg-gray-100"
                    aria-label={`Role for ${a.name}`}
                  >
                    <option value="full">Full Access</option>
                    <option value="read">Read Only</option>
                  </select>
                </td>
                <td className="py-2 px-3">
                  <input
                    type="checkbox"
                    checked={a.active}
                    onChange={(e) =>
                      updateAdmin(a.id, "active", e.target.checked)
                    }
                    disabled={!isPresident || a.email === "jackbryant5589@gmail.com"}
                    className="h-4 w-4 text-zontaGold rounded border-gray-300"
                    aria-label={`Toggle active status for ${a.name}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {status && <p className="text-sm text-zontaRed">{status}</p>}
    </div>
  );
}