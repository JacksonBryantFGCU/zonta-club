// zonta-server/src/routes/settingsRoutes.ts

import express from "express";

import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getSettings);
router.put("/", protect, updateSettings);

export default router;
