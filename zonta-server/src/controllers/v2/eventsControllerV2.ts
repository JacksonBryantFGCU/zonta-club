import type { Request, Response } from "express";

import {
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from "@services/sanityService";
import { sanityClient } from "@utils/sanityClient";
import type { BaseDocument } from "@utils/types";

interface Event extends BaseDocument {
  title: string;
  date: string;
  location?: string;
  description?: string;
}

/**
 * @route GET /api/v2/admin/events
 * @desc Get all events from Sanity
 * @access Protected
 */
export const getEventsV2 = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log("🧠 Fetching events from Sanity...");
    const query = `
      *[_type == "event"] | order(date desc) {
        _id,
        title,
        date,
        location,
        description
      }
    `;
    const events = await sanityClient.fetch(query);
    console.log(`✅ Events fetched: ${events.length}`);
    res.status(200).json(events);
  } catch (err) {
    console.error("❌ Failed to fetch events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

/**
 * @route GET /api/v2/admin/events/:id
 * @desc Get a single event by ID
 * @access Protected
 */
export const getEventByIdV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await fetchDocumentById<Event>(id);
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.status(200).json(event);
  } catch (err) {
    console.error("❌ Failed to fetch event by ID:", err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

/**
 * @route POST /api/v2/admin/events
 * @desc Create a new event
 * @access Protected
 */
export const createEventV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const newEvent = await createDocument<Event>("event", req.body);
    res.status(201).json({
      message: "✅ Event created successfully",
      event: newEvent,
    });
  } catch (err) {
    console.error("❌ Failed to create event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

/**
 * @route PUT /api/v2/admin/events/:id
 * @desc Update an event
 * @access Protected
 */
export const updateEventV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedEvent = await updateDocument<Event>(id, req.body);
    res.status(200).json({
      message: "✅ Event updated successfully",
      event: updatedEvent,
    });
  } catch (err) {
    console.error("❌ Failed to update event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

/**
 * @route DELETE /api/v2/admin/events/:id
 * @desc Delete an event
 * @access Protected
 */
export const deleteEventV2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteDocument(id);
    res.status(200).json({ message: "🗑️ Event deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};