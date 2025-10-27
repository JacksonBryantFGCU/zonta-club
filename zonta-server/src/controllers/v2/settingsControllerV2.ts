import type { Request, Response } from "express";

import { sanityClient } from "@services/sanityService";

// We'll store settings under a known, static document ID
const SETTINGS_DOC_ID = "siteSettingsSingleton";

export const getSettingsV2 = async (_req: Request, res: Response): Promise<void> => {
  try {
    // fetch full admin version
    const doc = await sanityClient.getDocument(SETTINGS_DOC_ID);

    if (!doc) {
      // If it doesn't exist yet, create it with defaults
      const defaultDoc = {
        _id: SETTINGS_DOC_ID,
        _type: "siteSettings",
        branding: {
          siteTitle: "Zonta Club of Naples",
          mission: "Empowering women through service and advocacy in the Naples community.",
          primaryHex: "#B8860B",
          accentHex: "#8B0000",
        },
        email: {
          publicEmail: "info@zontanaples.org",
          alertEmail: "treasurer@zontanaples.org",
          sendReceipts: true,
          sendNewOrderAlerts: true,
        },
        admins: [
          {
            id: "1",
            name: "Club President",
            email: "president@zontanaples.org",
            role: "full",
          },
          {
            id: "2",
            name: "Treasurer",
            email: "treasurer@zontanaples.org",
            role: "read",
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      const created = await sanityClient.createIfNotExists(defaultDoc);
      res.json(created);
      return;
    }

    res.json(doc);
  } catch (err) {
    console.error("getSettingsV2 error:", err);
    res.status(500).json({ message: "Unable to load settings" });
  }
};

export const updateSettingsV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branding, email, admins } = req.body;

    // basic sanity check to avoid overwriting with garbage
    if (!branding?.siteTitle) {
      res.status(400).json({ message: "branding.siteTitle is required" });
      return;
    }

    const updated = await sanityClient
      .patch(SETTINGS_DOC_ID)
      .set({
        branding,
        email,
        admins,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    res.json(updated);
  } catch (err) {
    console.error("updateSettingsV2 error:", err);
    res.status(500).json({ message: "Unable to update settings" });
  }
};
