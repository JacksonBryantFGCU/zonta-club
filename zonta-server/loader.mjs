/* eslint-env node */

import path from "path";
import { fileURLToPath } from "url";
import { loadConfig, createMatchPath } from "tsconfig-paths";

// Ensure __dirname works in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root of the project (not /dist)
const projectRoot = path.resolve(__dirname);

// Load tsconfig
const tsconfigPath = path.join(projectRoot, "tsconfig.json");
const configResult = loadConfig(tsconfigPath);

if (configResult.resultType === "failed") {
  console.error("❌ Failed to load tsconfig paths:", configResult.message);
  process.exit(1);
}

const matchPath = createMatchPath(
  configResult.absoluteBaseUrl,
  configResult.paths
);

// ESM Resolver Hook
export function resolve(specifier, context, nextResolve) {
  // Only rewrite @alias imports
  if (specifier.startsWith("@")) {
    const mapped = matchPath(specifier);

    if (mapped) {
      return nextResolve(mapped, context);
    }
  }

  return nextResolve(specifier, context);
}