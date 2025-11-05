import { useQuery } from "@tanstack/react-query";
import { sanity } from "../lib/sanityClient";

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
    shopEnabled: boolean;
    donationsEnabled: boolean;
  };
}

async function fetchPublicSettings(): Promise<PublicSettings> {
  const query = `*[_type == "siteSettings" && _id == "settings"][0]{
    maintenance,
    announcement,
    features
  }`;

  const settings = await sanity.fetch(query);

  // Return defaults if no settings found
  return settings || {
    maintenance: { enabled: false, message: "" },
    announcement: { enabled: false, text: "", link: "" },
    features: { shopEnabled: true, donationsEnabled: true },
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
