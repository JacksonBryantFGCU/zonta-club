// zonta-server/src/controllers/leadershipController.ts

import type { Request, Response } from "express";

import {
  createDocument,
  updateDocument,
  deleteDocument,
} from "@services/sanityService.js";
import { sanityClient } from "@utils/sanityClient.js";
import type { BaseDocument } from "@utils/types.js";

interface Leadership extends BaseDocument {
  name: string;
  role: string;
  bio?: string;
  image?: { _type: string; asset: { _ref: string } };
  order?: number;
}

/**
 * @route GET /api/admin/leadership
 * @desc Fetch all leadership members
 * @access Protected
 */
export const getLeadership = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching leadership team from Sanity...");

    const query = `
      *[_type == "leadership"] | order(order asc) {
        _id,
        name,
        role,
        bio,
        "imageUrl": image.asset->url
      }
    `;

    const leaders = await sanityClient.fetch(query);

    console.log(`Leadership fetched: ${leaders.length}`);
    res.status(200).json(leaders);
  } catch (err) {
    console.error("Failed to fetch leadership:", err);
    res.status(500).json({ error: "Failed to fetch leadership data" });
  }
};

/**
 * @route POST /api/admin/leadership
 * @desc Create a new leadership member
 * @access Protected
 */
export const createLeadership = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Creating new leadership member...");

    let leaderData = { ...req.body };

    // Handle image upload if imageData is provided
    if (req.body.imageData) {
      const base64Data = req.body.imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const imageAsset = await sanityClient.assets.upload("image", buffer, {
        filename: `leader-${Date.now()}.jpg`,
      });

      leaderData = {
        ...leaderData,
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        },
      };

      delete leaderData.imageData;
    }

    const newLeader = await createDocument<Leadership>("leadership", leaderData);
    res.status(201).json({
      message: "Leadership member created successfully",
      leader: newLeader,
    });
  } catch (err) {
    console.error("Failed to create leadership member:", err);
    res.status(500).json({ error: "Failed to create leadership member" });
  }
};

/**
 * @route PUT /api/admin/leadership/:id
 * @desc Update leadership member
 * @access Protected
 */
export const updateLeadership = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Updating leadership member: ${id}`);

    let updateData = { ...req.body };

    // Handle image upload if imageData is provided
    if (req.body.imageData) {
      const base64Data = req.body.imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const imageAsset = await sanityClient.assets.upload("image", buffer, {
        filename: `leader-${Date.now()}.jpg`,
      });

      updateData = {
        ...updateData,
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        },
      };

      delete updateData.imageData;
    }

    const updatedLeader = await updateDocument<Leadership>(id, updateData);
    res.status(200).json({
      message: "Leadership member updated successfully",
      leader: updatedLeader,
    });
  } catch (err) {
    console.error("Failed to update leadership member:", err);
    res.status(500).json({ error: "Failed to update leadership member" });
  }
};

/**
 * @route DELETE /api/admin/leadership/:id
 * @desc Delete leadership member
 * @access Protected
 */
export const deleteLeadership = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Deleting leadership member: ${id}`);

    await deleteDocument(id);
    res.status(200).json({ message: "Leadership member deleted successfully" });
  } catch (err) {
    console.error("Failed to delete leadership member:", err);
    res.status(500).json({ error: "Failed to delete leadership member" });
  }
};