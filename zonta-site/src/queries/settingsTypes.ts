// zonta-site/src/queries/settingsTypes.ts

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
  donationsEnabled: boolean;
}

export interface SettingsState {
  _id?: string;
  _type?: string;
  maintenance: MaintenanceSettings;
  announcement: AnnouncementSettings;
  features: FeatureToggles;
  updatedAt?: string;
}
