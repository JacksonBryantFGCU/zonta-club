import path from "path";
import { fileURLToPath } from "url";

import { loadConfig, register } from "tsconfig-paths";

// Resolve the directory of the compiled file (dist/bootstrap.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// projectRoot = /opt/render/project/src/zonta-server (Render)
// or path/to/zonta-server locally
const projectRoot = path.resolve(__dirname, "..");

// Path to tsconfig.json in project root
const tsconfigPath = path.join(projectRoot, "tsconfig.json");

// Load the tsconfig.json config
const configResult = loadConfig(tsconfigPath);

if (configResult.resultType === "failed") {
  console.error("❌ Failed to load tsconfig.json:", configResult.message);
  process.exit(1);
}

// Register path aliases
register({
  baseUrl: configResult.absoluteBaseUrl,
  paths: configResult.paths,
});

console.log("✅ Path aliases loaded.");