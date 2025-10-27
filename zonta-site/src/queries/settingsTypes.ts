export type AdminRole = "full" | "read";

export interface BrandingSettings {
  siteTitle: string;
  mission: string;
  primaryHex: string;
  accentHex: string;
}

export interface EmailSettings {
  publicEmail: string;
  alertEmail: string;
  sendReceipts: boolean;
  sendNewOrderAlerts: boolean;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export interface SettingsState {
  branding: BrandingSettings;
  email: EmailSettings;
  admins: AdminAccount[];
  updatedAt?: string; // ISO string from backend, optional
}