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

const FETCH_TIMEOUT_MS = 5000;

async function fetchPublicSettings(): Promise<PublicSettings> {
  const base = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "");
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  if (import.meta.env.DEV) {
    console.log("[settings] fetch start", new Date().toISOString());
  }

  try {
    const res = await fetch(`${base}/api/public/settings`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!res.ok) {
      if (import.meta.env.DEV) {
        console.warn("[settings] non-ok response", res.status);
      }
      return DEFAULT_SETTINGS;
    }

    const data = (await res.json()) as Partial<PublicSettings> | null;

    if (import.meta.env.DEV) {
      console.log("[settings] fetch success", new Date().toISOString());
    }

    return {
      maintenance: data?.maintenance ?? DEFAULT_SETTINGS.maintenance,
      announcement: data?.announcement ?? DEFAULT_SETTINGS.announcement,
      features: data?.features ?? DEFAULT_SETTINGS.features,
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      const reason = controller.signal.aborted ? "timeout" : "error";
      console.warn("[settings] fetch", reason, err);
    }
    return DEFAULT_SETTINGS;
  } finally {
    clearTimeout(timerId);
  }
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["publicSettings"],
    queryFn: fetchPublicSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes — matches global default
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
