/* eslint-env node */

import path from "path";
import { fileURLToPath } from "url";
import { loadConfig, createMatchPath } from "tsconfig-paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dist/loader.js → project root
const projectRoot = path.resolve(__dirname, "..");

const tsconfigPath = path.join(projectRoot, "tsconfig.json");
const configResult = loadConfig(tsconfigPath);

if (configResult.resultType === "failed") {
  console.error("Failed to load tsconfig:", configResult.message);
  process.exit(1);
}

const matchPath = createMatchPath(configResult.absoluteBaseUrl, configResult.paths);

// ESM resolver hook
export function resolve(specifier: string, context: any, nextResolve: any) {
  if (specifier.startsWith("@")) {
    const mapped = matchPath(specifier);
    if (mapped) {
      return nextResolve(mapped, context);
    }
  }
  return nextResolve(specifier, context);
}