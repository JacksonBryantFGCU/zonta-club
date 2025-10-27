import express from "express";

import {
  getPublicMemberships,
  submitMembershipApplication,
} from "@controllers/v2/membershipsPublicController";

const router = express.Router();

router.get("/", getPublicMemberships);
router.post("/apply", submitMembershipApplication);

export default router;