// zonta-site/src/queries/publicSettingsQueries.ts

import { useQuery } from "@tanstack/react-query";

export interface PublicSettings {
  maintenance: {
    enabled: boolean;
    message: string;
  };
  announcement: {
    enabled: boolean;
    text: string;
    link: string;
  };
  features: {
    donationsEnabled: boolean;
  };
}

const DEFAULT_SETTINGS: PublicSettings = {
  maintenance: { enabled: false, message: "" },
  announcement: { enabled: false, text: "", link: "" },
  features: { donationsEnabled: true },
};

async function fetchPublicSettings(): Promise<PublicSettings> {
  const base = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "");
  const res = await fetch(`${base}/api/public/settings`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return DEFAULT_SETTINGS;

  const data = (await res.json()) as Partial<PublicSettings> | null;
  return {
    maintenance: data?.maintenance ?? DEFAULT_SETTINGS.maintenance,
    announcement: data?.announcement ?? DEFAULT_SETTINGS.announcement,
    features: data?.features ?? DEFAULT_SETTINGS.features,
  };
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["publicSettings"],
    queryFn: fetchPublicSettings,
    staleTime: 1000 * 10, // Cache for 10 seconds (shorter for faster updates)
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts
  });
}
