// zonta-server/src/routes/onlineDonationsRoutes.ts

import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getOnlineDonations } from "../controllers/onlineDonationsController.js";

const router = Router();

router.get("/", protect, getOnlineDonations);

export default router;
