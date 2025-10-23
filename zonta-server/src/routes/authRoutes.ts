import { Router } from "express";

import { adminLogin } from "@controllers/authController";

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Admin login
 */
router.post("/login", adminLogin);

export default router;