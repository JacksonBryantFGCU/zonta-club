// zonta-server/src/routes/eventsRoutes.ts

import express from "express";

import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@controllers/eventsController";
import { protect } from "@middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getEvents);
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;
