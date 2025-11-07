// zonta-site/src/hooks/useAnnouncementBanner.ts

import { useState, useEffect } from "react";
import { usePublicSettings } from "../queries/publicSettingsQueries";

// Shared state for announcement banner visibility
let dismissedState = false;
const listeners = new Set<(value: boolean) => void>();

export function useAnnouncementBanner() {
  const { data: settings } = usePublicSettings();
  const [dismissed, setDismissed] = useState(dismissedState);

  useEffect(() => {
    const listener = (value: boolean) => setDismissed(value);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const dismiss = () => {
    dismissedState = true;
    listeners.forEach(listener => listener(true));
  };

  // Reset dismissed state when announcement text changes (new announcement)
  useEffect(() => {
    if (settings?.announcement.text) {
      dismissedState = false;
      listeners.forEach(listener => listener(false));
    }
  }, [settings?.announcement.text]);

  const isVisible = settings?.announcement.enabled && 
                   !dismissed && 
                   !!settings.announcement.text;

  return {
    isVisible,
    dismiss,
    announcement: settings?.announcement,
  };
}
