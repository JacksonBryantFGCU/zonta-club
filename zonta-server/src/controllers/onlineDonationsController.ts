// zonta-server/src/controllers/onlineDonationsController.ts
// Admin endpoint: list online Square donation records stored in Sanity.

import type { Request, Response } from "express";
import { listOnlineDonationRecords } from "../services/onlineDonationService.js";

export const getOnlineDonations = async (
  req: Request,
  res: Response
): Promise<void> => {
  const rawLimit = parseInt(String(req.query.limit ?? "100"), 10);
  const limit = isNaN(rawLimit) ? 100 : rawLimit;

  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const givingLevel =
    typeof req.query.givingLevel === "string" ? req.query.givingLevel : undefined;
  const environment =
    typeof req.query.environment === "string" ? req.query.environment : undefined;
  const giftType =
    typeof req.query.giftType === "string" ? req.query.giftType : undefined;

  try {
    const records = await listOnlineDonationRecords({
      limit,
      status,
      givingLevel,
      environment,
      giftType,
    });
    res.json({ donations: records, count: records.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("[OnlineDonations] Failed to list records:", message);
    res.status(500).json({ error: "Failed to fetch donation records." });
  }
};
