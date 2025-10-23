import { createClient } from "@sanity/client";

if (process.env.SANITY_PROJECT_ID) {
  console.log("✅ Sanity project:", process.env.SANITY_PROJECT_ID);
}

export const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  apiVersion: "2023-10-16",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});
