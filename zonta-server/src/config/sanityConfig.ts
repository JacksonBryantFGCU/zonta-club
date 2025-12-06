// zonta-server/config/sanityConfig.ts

import dotenv from "dotenv";
dotenv.config();

export const sanityConfig = {
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || "zonta-dev",
  apiVersion: process.env.SANITY_API_VERSION || "2023-10-16",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false, // Always false for admin operations
};

//  Helpful validation
if (!sanityConfig.projectId || !sanityConfig.dataset) {
  console.error(" Missing Sanity configuration!");
  console.error("Check your .env for SANITY_PROJECT_ID and SANITY_DATASET");
  process.exit(1);
}

console.log(" Loaded Sanity Config:", {
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
});
