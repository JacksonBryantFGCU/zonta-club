// zonta-server/src/controllers/settingsController.ts

import type { Request, Response } from "express";

import { sanityClient } from "../services/sanityService.js";

const SETTINGS_DOC_ID = "settings";

const DEFAULT_FEATURES = { donationsEnabled: true };

/**
 * @route GET /api/public/settings
 */
export const getPublicSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const doc = await sanityClient.getDocument(SETTINGS_DOC_ID);

    res.status(200).json({
      maintenance: doc?.maintenance ?? { enabled: false, message: "" },
      announcement: doc?.announcement ?? { enabled: false, text: "", link: "" },
      features: doc?.features ?? DEFAULT_FEATURES,
    });
  } catch (err) {
    console.error("getPublicSettings error:", err);
    res.status(200).json({
      maintenance: { enabled: false, message: "" },
      announcement: { enabled: false, text: "", link: "" },
      features: DEFAULT_FEATURES,
    });
  }
};

/**
 * @route GET /api/admin/settings
 */
export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const doc = await sanityClient.getDocument(SETTINGS_DOC_ID);

    if (!doc) {
      const defaultSettings = {
        _id: SETTINGS_DOC_ID,
        _type: "siteSettings",
        maintenance: { enabled: false, message: "" },
        announcement: { enabled: false, text: "", link: "" },
        features: DEFAULT_FEATURES,
        updatedAt: new Date().toISOString(),
      };
      const created = await sanityClient.createIfNotExists(defaultSettings);
      res.status(200).json(created);
      return;
    }

    res.status(200).json(doc);
  } catch (err) {
    console.error("getSettings error:", err);
    res.status(500).json({ message: "Unable to load settings" });
  }
};

/**
 * @route PUT /api/admin/settings
 */
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { maintenance, announcement, features } = req.body;

    const updated = await sanityClient
      .patch(SETTINGS_DOC_ID)
      .set({
        maintenance,
        announcement,
        features,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    res.status(200).json(updated);
  } catch (err) {
    console.error("updateSettings error:", err);
    res.status(500).json({ message: "Unable to update settings" });
  }
};
