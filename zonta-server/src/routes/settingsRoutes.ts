// zonta-server/src/routes/settingsRoutes.ts

import express from "express";

import {
  getPublicSettings,
  getSettings,
  updateSettings,
} from "../controllers/settingsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getSettings);
router.put("/", protect, updateSettings);

export const publicSettingsRouter = express.Router();
publicSettingsRouter.get("/", getPublicSettings);

export default router;
