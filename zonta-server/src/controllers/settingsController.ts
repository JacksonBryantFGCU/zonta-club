// zonta-server/src/controllers/settingsController.ts

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import type { Request, Response } from "express";

import { sanityClient } from "@services/sanityService.js";

// Fix for ESM so __dirname works
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_DOC_ID = "settings";
const ADMINS_FILE = path.resolve(__dirname, "../../config/admins.json");

/**
 * @route GET /api/admin/settings
 * @desc Fetch merged site settings (Sanity + secure admin data)
 * @access Protected
 */
export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching site settings...");
    const doc = await sanityClient.getDocument(SETTINGS_DOC_ID);

    if (!doc) {
      const defaultSettings = {
        _id: SETTINGS_DOC_ID,
        _type: "siteSettings",
        maintenance: { enabled: false, message: "" },
        announcement: { enabled: false, text: "", link: "" },
        features: { shopEnabled: true, donationsEnabled: true },
        admins: [
          { id: "1", name: "Club President", email: "president@zontanaples.org", role: "full", active: true },
          { id: "2", name: "Treasurer", email: "treasurer@zontanaples.org", role: "read", active: true },
        ],
        updatedAt: new Date().toISOString(),
      };
      const created = await sanityClient.createIfNotExists(defaultSettings);
      res.status(200).json(created);
      return;
    }

    // Load secure admin credentials from config/admins.json
    const raw = fs.readFileSync(ADMINS_FILE, "utf8");
    const fileAdmins = JSON.parse(raw);

    // Merge with Sanity admins
    const sanityAdmins = doc.admins || [];
    const mergedAdmins = fileAdmins.map((admin: any, index: number) => {
      const sanityMeta = sanityAdmins.find((a: any) => a.email === admin.email);
      return {
        id: sanityMeta?.id ?? `${index + 1}`,
        name: sanityMeta?.name ?? "Admin User",
        email: admin.email,
        role: sanityMeta?.role ?? "read",
        active: sanityMeta?.active ?? true,
      };
    });

    const mergedDoc = { ...doc, admins: mergedAdmins };
    res.status(200).json(mergedDoc);
  } catch (err) {
    console.error("getSettings error:", err);
    res.status(500).json({ message: "Unable to load settings" });
  }
};

/**
 * @route PUT /api/admin/settings
 * @desc Update site settings (president-restricted for admin changes)
 * @access Protected
 */
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { maintenance, announcement, features, admins } = req.body;

    console.log("Updating site settings...");
    console.log("User email:", user?.email);

    // Check if user has full access role
    if (admins && user?.email !== "jackbryant5589@gmail.com") {
      res.status(403).json({
        message: "Only the Club President can change admin roles.",
      });
      return;
    }

    const updated = await sanityClient
      .patch(SETTINGS_DOC_ID)
      .set({
        maintenance,
        announcement,
        features,
        admins,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    console.log("Settings updated successfully.");
    res.status(200).json(updated);
  } catch (err) {
    console.error("updateSettings error:", err);
    res.status(500).json({ message: "Unable to update settings" });
  }
};