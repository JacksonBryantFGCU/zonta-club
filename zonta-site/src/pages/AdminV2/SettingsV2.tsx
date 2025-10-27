import { useState } from "react";

type BrandingSettings = {
  siteTitle: string;
  mission: string;
  primaryHex: string;
  accentHex: string;
};

type EmailSettings = {
  publicEmail: string;
  alertEmail: string;
  sendReceipts: boolean;
  sendNewOrderAlerts: boolean;
};

type AdminRole = "full" | "read";

type AdminAccount = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

type SettingsState = {
  branding: BrandingSettings;
  email: EmailSettings;
  admins: AdminAccount[];
};

export default function SettingsV2() {
  // ----- current saved settings (pretend from backend) -----
  const [savedSettings, setSavedSettings] = useState<SettingsState>({
    branding: {
      siteTitle: "Zonta Club of Naples",
      mission:
        "Empowering women through service and advocacy in the Naples community.",
      primaryHex: "#B8860B",
      accentHex: "#8B0000",
    },
    email: {
      publicEmail: "info@zontanaples.org",
      alertEmail: "treasurer@zontanaples.org",
      sendReceipts: true,
      sendNewOrderAlerts: true,
    },
    admins: [
      {
        id: "1",
        name: "Club President",
        email: "president@zontanaples.org",
        role: "full",
      },
      {
        id: "2",
        name: "Treasurer",
        email: "treasurer@zontanaples.org",
        role: "read",
      },
    ],
  });

  // ----- draft / unsaved form state -----
  const [draftSettings, setDraftSettings] = useState<SettingsState>(
    structuredClone(savedSettings)
  );

  const [statusMessage, setStatusMessage] = useState<string>("");

  // helpers to update nested pieces without using any
  function updateBranding<K extends keyof BrandingSettings>(
    key: K,
    value: BrandingSettings[K]
  ) {
    setDraftSettings((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        [key]: value,
      },
    }));
  }

  function updateEmail<K extends keyof EmailSettings>(
    key: K,
    value: EmailSettings[K]
  ) {
    setDraftSettings((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value,
      },
    }));
  }

  function updateAdminRole(id: string, role: AdminRole) {
    setDraftSettings((prev) => ({
      ...prev,
      admins: prev.admins.map((a) => (a.id === id ? { ...a, role } : a)),
    }));
  }

  // reset
  function handleReset() {
    setDraftSettings(structuredClone(savedSettings));
    setStatusMessage("Changes discarded");
    setTimeout(() => setStatusMessage(""), 4000);
  }

  // save
  function handleSave() {
    // this is where you'd call your mutation / fetch POST
    // await saveSettings(draftSettings)

    setSavedSettings(structuredClone(draftSettings));
    setStatusMessage("✅ Settings saved");
    setTimeout(() => setStatusMessage(""), 4000);
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zontaRed">Site Settings</h1>
          <p className="text-sm text-gray-600">
            Update website branding, outgoing emails, and admin access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-zontaGold text-white rounded-md shadow hover:bg-zontaRed transition text-sm font-medium"
          >
            Save Changes
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition text-sm font-medium"
          >
            Reset
          </button>
        </div>
      </header>

      {statusMessage && (
        <div className="text-sm font-medium text-zontaRed">{statusMessage}</div>
      )}

      {/* BRANDING CARD */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-5 py-4 flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zontaRed">
            Branding & Appearance
          </h2>
          <p className="text-sm text-gray-600">
            Controls what visitors see in the header, footer, and emails.
          </p>
        </div>

        <div className="p-5 grid gap-6 md:grid-cols-2">
          {/* Site Title */}
          <div className="flex flex-col">
            <label
              htmlFor="siteTitle"
              className="text-sm font-medium text-gray-700"
            >
              Site Title
            </label>
            <input
              id="siteTitle"
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zontaGold"
              value={draftSettings.branding.siteTitle}
              onChange={(e) => updateBranding("siteTitle", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Shown in the navbar and browser tab.
            </p>
          </div>

          {/* Mission */}
          <div className="flex flex-col">
            <label
              htmlFor="mission"
              className="text-sm font-medium text-gray-700"
            >
              Mission Statement
            </label>
            <textarea
              id="mission"
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zontaGold resize-none min-h-[70px]"
              value={draftSettings.branding.mission}
              onChange={(e) => updateBranding("mission", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Displayed in About / footer / emails.
            </p>
          </div>

          {/* Primary Color */}
          <div className="flex flex-col">
            <label
              htmlFor="primaryHex"
              className="text-sm font-medium text-gray-700 flex items-center justify-between"
            >
              <span>Primary Brand Color</span>
              <span
                className="ml-2 inline-block h-4 w-4 rounded border border-gray-300"
                style={{ backgroundColor: draftSettings.branding.primaryHex }}
              />
            </label>
            <input
              id="primaryHex"
              type="text"
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-zontaGold"
              value={draftSettings.branding.primaryHex}
              onChange={(e) => updateBranding("primaryHex", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Example: #B8860B</p>
          </div>

          {/* Accent Color */}
          <div className="flex flex-col">
            <label
              htmlFor="accentHex"
              className="text-sm font-medium text-gray-700 flex items-center justify-between"
            >
              <span>Accent Color</span>
              <span
                className="ml-2 inline-block h-4 w-4 rounded border border-gray-300"
                style={{ backgroundColor: draftSettings.branding.accentHex }}
              />
            </label>
            <input
              id="accentHex"
              type="text"
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-zontaGold"
              value={draftSettings.branding.accentHex}
              onChange={(e) => updateBranding("accentHex", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Used for buttons, alerts, emphasis.
            </p>
          </div>
        </div>
      </section>

      {/* EMAIL CARD */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-5 py-4 flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zontaRed">
            Email & Notifications
          </h2>
          <p className="text-sm text-gray-600">
            Where public messages go and who gets alerts.
          </p>
        </div>

        <div className="p-5 grid gap-6 md:grid-cols-2">
          {/* Public Email */}
          <div className="flex flex-col">
            <label
              htmlFor="publicEmail"
              className="text-sm font-medium text-gray-700"
            >
              Public Contact Email
            </label>
            <input
              id="publicEmail"
              type="email"
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zontaGold"
              value={draftSettings.email.publicEmail}
              onChange={(e) => updateEmail("publicEmail", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Shown on Contact page and footer.
            </p>
          </div>

          {/* Alert Email */}
          <div className="flex flex-col">
            <label
              htmlFor="alertEmail"
              className="text-sm font-medium text-gray-700"
            >
              Send Order Alerts To
            </label>
            <input
              id="alertEmail"
              type="email"
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zontaGold"
              value={draftSettings.email.alertEmail}
              onChange={(e) => updateEmail("alertEmail", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              We’ll notify this address whenever a new order is placed.
            </p>
          </div>

          {/* SendReceipts Checkbox */}
          <div className="flex flex-col">
            <label
              htmlFor="sendReceipts"
              className="text-sm font-medium text-gray-700"
            >
              Buyer Receipt Emails
            </label>

            <div className="flex items-start gap-2 mt-2">
              <input
                id="sendReceipts"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-zontaGold focus:ring-zontaGold"
                checked={draftSettings.email.sendReceipts}
                onChange={(e) => updateEmail("sendReceipts", e.target.checked)}
              />
              <p className="text-sm text-gray-600">
                Send each buyer an automatic confirmation/receipt email after
                checkout.
              </p>
            </div>
          </div>

          {/* NewOrderAlerts Checkbox */}
          <div className="flex flex-col">
            <label
              htmlFor="sendNewOrderAlerts"
              className="text-sm font-medium text-gray-700"
            >
              Internal New-Order Alerts
            </label>

            <div className="flex items-start gap-2 mt-2">
              <input
                id="sendNewOrderAlerts"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-zontaGold focus:ring-zontaGold"
                checked={draftSettings.email.sendNewOrderAlerts}
                onChange={(e) =>
                  updateEmail("sendNewOrderAlerts", e.target.checked)
                }
              />
              <p className="text-sm text-gray-600">
                Email the alert address immediately when someone places an
                order.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ADMIN CARD */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-5 py-4 flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zontaRed">Admin Access</h2>
          <p className="text-sm text-gray-600">
            Control who can log into the dashboard and what they’re allowed to
            do.
          </p>
        </div>

        <div className="p-5 overflow-x-auto">
          <table className="w-full text-left text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-2 px-3 font-medium">Name</th>
                <th className="py-2 px-3 font-medium">Email</th>
                <th className="py-2 px-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {draftSettings.admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="py-3 px-3 font-medium text-gray-800">
                    {admin.name}
                  </td>
                  <td className="py-3 px-3 text-gray-600">{admin.email}</td>
                  <td className="py-3 px-3">
                    <select
                      aria-label={`Role for ${admin.name}`}
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-zontaGold"
                      value={admin.role}
                      onChange={(e) =>
                        updateAdminRole(
                          admin.id,
                          e.target.value === "full" ? "full" : "read"
                        )
                      }
                    >
                      <option value="full">Full Access</option>
                      <option value="read">Read Only</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-gray-500 mt-4">
            Full Access can add/edit products, change orders, and edit settings.
            Read Only can view dashboards and orders, but cannot edit.
          </p>
        </div>
      </section>

      {/* SAVE BAR (MOBILE FRIENDLY TOO) */}
      <footer className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-10">
        <div className="text-xs text-gray-500">
          These changes affect the live site and outgoing emails.
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-zontaGold text-white rounded-md shadow hover:bg-zontaRed transition text-sm font-medium"
          >
            Save Changes
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition text-sm font-medium"
          >
            Reset
          </button>
        </div>
      </footer>
    </div>
  );
}