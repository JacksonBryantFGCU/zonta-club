// zonta-server/src/routes/eventsRoutes.ts

import express from "express";

import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@controllers/eventsController.js";
import { protect } from "@middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getEvents);
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;
