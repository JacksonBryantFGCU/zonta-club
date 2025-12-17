// zonta-server/src/utils/sanityClient.ts

import { createClient } from "@sanity/client";

import { sanityConfig } from "../config/sanityConfig.js";

export const sanityClient = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  token: sanityConfig.token,
  useCdn: sanityConfig.useCdn,
});
