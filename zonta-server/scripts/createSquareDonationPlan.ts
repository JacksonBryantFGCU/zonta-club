// zonta-server/scripts/createSquareDonationPlan.ts
// Creates the Square Catalog subscription plan + plan variation required for
// monthly donations. Run once per environment (sandbox and production).
//
// Usage (from zonta-server/):
//   npm run square:create-donation-plan
//
// The npm script loads .env via dotenv-cli before running this file.

import { SquareClient, SquareEnvironment } from "square";
import crypto from "crypto";

async function main(): Promise<void> {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const squareEnv = process.env.SQUARE_ENVIRONMENT ?? "sandbox";

  if (!token) {
    console.error(
      "Error: SQUARE_ACCESS_TOKEN is not set.\n" +
        "Add it to zonta-server/.env and retry."
    );
    process.exit(1);
  }

  const client = new SquareClient({
    token,
    environment:
      squareEnv === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });

  console.log(
    `\nCreating Square subscription plan in ${squareEnv} environment…`
  );

  try {
    // Use a batch upsert so the variation can reference the plan via its
    // temp ID "#plan" before the real ID is known.
    const res = await client.catalog.batchUpsert({
      idempotencyKey: crypto.randomUUID(),
      batches: [
        {
          objects: [
            {
              type: "SUBSCRIPTION_PLAN",
              id: "#plan",
              subscriptionPlanData: {
                name: "Zonta Monthly Donation",
              },
            },
            {
              type: "SUBSCRIPTION_PLAN_VARIATION",
              id: "#variation",
              subscriptionPlanVariationData: {
                name: "Monthly Donation",
                subscriptionPlanId: "#plan",
                phases: [
                  {
                    cadence: "MONTHLY",
                    ordinal: BigInt(0),
                    pricing: {
                      type: "STATIC",
                      priceMoney: {
                        // $1.00 base price. The actual monthly charge is
                        // overridden via priceOverrideMoney in
                        // client.subscriptions.create() at donation time.
                        amount: BigInt(100),
                        currency: "USD",
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    // The response contains an idMappings array mapping temp "#id" → real ID.
    const idMappings = res.idMappings ?? [];
    const variationId = idMappings.find(
      (m) => m.clientObjectId === "#variation"
    )?.objectId;
    const planId = idMappings.find(
      (m) => m.clientObjectId === "#plan"
    )?.objectId;

    if (!variationId) {
      console.error(
        "\nCould not find plan variation ID in the response.\nFull response:\n",
        JSON.stringify(
          res,
          (_k, v) => (typeof v === "bigint" ? v.toString() : v),
          2
        )
      );
      process.exit(1);
    }

    console.log(`\nSubscription plan created!\n`);
    console.log(`  Square environment:  ${squareEnv}`);
    if (planId) console.log(`  Plan ID:             ${planId}`);
    console.log(`  Plan Variation ID:   ${variationId}`);
    console.log(`\nAdd to zonta-server/.env:`);
    console.log(`  SQUARE_DONATION_PLAN_VARIATION_ID=${variationId}`);
    console.log(
      `\nRestart the backend after adding the env var.\n` +
        `Run this script again with production credentials when ready to go live.`
    );
  } catch (err: unknown) {
    console.error("\nFailed to create subscription plan.");

    if (err !== null && typeof err === "object" && "errors" in err) {
      const sqErrs = (err as { errors: unknown }).errors;
      console.error("Square errors:\n", JSON.stringify(sqErrs, null, 2));
    } else {
      console.error(err instanceof Error ? err.message : String(err));
    }

    console.error(
      "\nManual fallback: follow the steps in PAYMENT_SETUP.md → " +
        '"Manual setup" under Recurring donations.'
    );
    process.exit(1);
  }
}

void main();
