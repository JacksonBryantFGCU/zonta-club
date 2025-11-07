// zonta-site/src/queries/settingsTypes.ts

export type AdminRole = "full" | "read";

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
}

export interface AnnouncementSettings {
  enabled: boolean;
  text: string;
  link: string;
}

export interface FeatureToggles {
  shopEnabled: boolean;
  donationsEnabled: boolean;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
}

export interface SettingsState {
  _id?: string;
  _type?: string;
  maintenance: MaintenanceSettings;
  announcement: AnnouncementSettings;
  features: FeatureToggles;
  admins: AdminAccount[];
  updatedAt?: string; // ISO string from backend, optional
}
