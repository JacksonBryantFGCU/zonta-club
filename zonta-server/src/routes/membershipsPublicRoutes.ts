// zonta-server/src/routes/membershipsPublicRoutes.ts

import express from "express";

import {
  getPublicMemberships,
  submitMembershipApplication,
} from "@controllers/membershipsPublicController";

const router = express.Router();

router.get("/", getPublicMemberships);
router.post("/apply", submitMembershipApplication);

export default router;
