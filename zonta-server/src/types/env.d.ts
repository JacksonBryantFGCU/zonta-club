// zonta-server/src/types/env.d.ts

declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;

    FRONTEND_URL: string;

    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    STRIPE_SHIPPING_RATE?: string;

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