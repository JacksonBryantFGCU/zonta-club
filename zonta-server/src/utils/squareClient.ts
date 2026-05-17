// zonta-server/src/utils/squareClient.ts
// Square SDK v44 — SquareClient with lazy initialization.

import { SquareClient, SquareEnvironment } from "square";

const REQUIRED_VARS = [
  "SQUARE_ACCESS_TOKEN",
  "SQUARE_LOCATION_ID",
  "SQUARE_ENVIRONMENT",
] as const;

type RequiredVar = (typeof REQUIRED_VARS)[number];

export function isSquareConfigured(): boolean {
  return REQUIRED_VARS.every((k: RequiredVar) => Boolean(process.env[k]));
}

// Warn at module load time but do not crash the server.
// Square endpoints return 503 until required vars are set.
const missingAtStartup: string[] = REQUIRED_VARS.filter(
  (k: RequiredVar) => !process.env[k]
);
if (missingAtStartup.length > 0) {
  console.warn(
    `[Square] Missing env vars: ${missingAtStartup.join(", ")}. ` +
      "Square payment endpoints will return 503 until these are configured."
  );
}

let _client: SquareClient | null = null;

/**
 * Returns a lazily-initialized Square client singleton.
 * Throws if required env vars are not set — callers should guard with
 * isSquareConfigured() or catch the error and return 503.
 */
export function getSquareClient(): SquareClient {
  if (_client) return _client;

  if (!isSquareConfigured()) {
    throw new Error(
      "Square is not configured. Set SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, and SQUARE_ENVIRONMENT."
    );
  }

  const env =
    process.env.SQUARE_ENVIRONMENT === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox;

  _client = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment: env,
  });

  console.log(
    `[Square] Client initialized — environment: ${process.env.SQUARE_ENVIRONMENT ?? "sandbox"}`
  );

  return _client;
}

export function getSquareLocationId(): string {
  const id = process.env.SQUARE_LOCATION_ID;
  if (!id) throw new Error("SQUARE_LOCATION_ID is not configured.");
  return id;
}
