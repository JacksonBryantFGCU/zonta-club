import express from "express";

import { getSettingsV2, updateSettingsV2 } from "@controllers/v2/settingsControllerV2";
import { protect } from "@middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getSettingsV2);
router.put("/", protect, updateSettingsV2);

export default router;
