// zonta-server/src/controllers/eventsController.ts

import type { Request, Response } from "express";

import {
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from "@services/sanityService.js";
import { sanityClient } from "@utils/sanityClient.js";
import type { BaseDocument } from "@utils/types.js";

interface Event extends BaseDocument {
  title: string;
  date: string;
  location?: string;
  description?: string;
}

/**
 * @route GET /api/admin/events
 * @desc Get all events from Sanity (with image URLs)
 * @access Protected
 */
export const getEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching events from Sanity...");
    const query = `
      *[_type == "event"] | order(date desc) {
        _id,
        title,
        date,
        location,
        description,
        "imageUrl": image.asset->url
      }
    `;
    const events = await sanityClient.fetch(query);
    console.log(`Events fetched: ${events.length}`);
    res.status(200).json(events);
  } catch (err) {
    console.error("Failed to fetch events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

/**
 * @route GET /api/admin/events/:id
 * @desc Get a single event by ID
 * @access Protected
 */
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await fetchDocumentById<Event>(id);
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.status(200).json(event);
  } catch (err) {
    console.error("Failed to fetch event by ID:", err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

/**
 * @route POST /api/admin/events
 * @desc Create a new event (with optional image)
 * @access Protected
 */
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageData, ...eventData } = req.body;
    
    let imageAsset = null;
    
    // If imageData is provided (base64), upload to Sanity
    if (imageData) {
      try {
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        imageAsset = await sanityClient.assets.upload('image', buffer, {
          filename: `event-${Date.now()}.jpg`,
        });
        
        console.log('Image uploaded to Sanity:', imageAsset._id);
      } catch (imageError) {
        console.error('Image upload failed:', imageError);
      }
    }
    
    // Prepare event data with image reference
    const eventWithImage = {
      ...eventData,
      ...(imageAsset && {
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id,
          },
        },
      }),
    };
    
    const newEvent = await createDocument<Event>("event", eventWithImage);
    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (err) {
    console.error("Failed to create event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

/**
 * @route PUT /api/admin/events/:id
 * @desc Update an event (with optional image update)
 * @access Protected
 */
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { imageData, ...eventData } = req.body;
    
    let imageAsset = null;
    
    // If imageData is provided, upload new image to Sanity
    if (imageData) {
      try {
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        imageAsset = await sanityClient.assets.upload('image', buffer, {
          filename: `event-${Date.now()}.jpg`,
        });
        
        console.log('Image uploaded to Sanity:', imageAsset._id);
      } catch (imageError) {
        console.error('Image upload failed:', imageError);
      }
    }
    
    // Prepare event data with optional new image reference
    const eventWithImage = {
      ...eventData,
      ...(imageAsset && {
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id,
          },
        },
      }),
    };
    
    const updatedEvent = await updateDocument<Event>(id, eventWithImage);
    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (err) {
    console.error("Failed to update event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

/**
 * @route DELETE /api/admin/events/:id
 * @desc Delete an event
 * @access Protected
 */
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteDocument(id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Failed to delete event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};