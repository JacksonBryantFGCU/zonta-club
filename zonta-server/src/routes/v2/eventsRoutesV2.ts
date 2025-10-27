import express from "express";

import {
  getEventsV2,
  createEventV2,
  updateEventV2,
  deleteEventV2,
} from "@controllers/v2/eventsControllerV2";
import { protect } from "@middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getEventsV2);
router.post("/", protect, createEventV2);
router.put("/:id", protect, updateEventV2);
router.delete("/:id", protect, deleteEventV2);

export default router;
