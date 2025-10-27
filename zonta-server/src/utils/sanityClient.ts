import { sanityConfig } from "@config/sanityConfig";
import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  token: sanityConfig.token,
  useCdn: sanityConfig.useCdn,
});