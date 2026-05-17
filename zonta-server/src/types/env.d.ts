// zonta-server/src/types/env.d.ts

declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;

    FRONTEND_URL: string;

    // Square — required for one-time donation payments
    SQUARE_ACCESS_TOKEN?: string;
    SQUARE_LOCATION_ID?: string;
    SQUARE_ENVIRONMENT?: string; // "sandbox" | "production"

    // Square — not required until recurring donations are wired
    SQUARE_DONATION_PLAN_VARIATION_ID?: string;

    // Square — not required until webhook verification is wired
    SQUARE_WEBHOOK_SIGNATURE_KEY?: string;

    SANITY_PROJECT_ID: string;
    SANITY_DATASET: string;
    SANITY_WRITE_TOKEN: string;

    EMAIL_USER?: string;
    EMAIL_PASS?: string;

    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
    JWT_SECRET?: string;
    TOKEN_EXPIRY?: string;

    CLUB_NAME?: string;
    CLUB_ADDRESS?: string;
    CLUB_EMAIL?: string;
    CLUB_URL?: string;
  }
}