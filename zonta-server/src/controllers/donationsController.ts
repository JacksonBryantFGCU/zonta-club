import type { Request, Response } from "express";

import { asyncHandler } from "@middlewares/asyncHandler";
import { createDocument, updateDocument, deleteDocument } from "@services/sanityService";
import { sanityClient } from "@utils/sanityClient";

interface Donation {
  title: string;
  description: string;
  presetAmounts: number[];
  allowCustomAmount: boolean;
  minAmount: number;
  image?: {
    _type: "image";
    asset: {
      _type: "reference";
      _ref: string;
    };
  };
  active: boolean;
  order: number;
}

/**
 * @route GET /api/admin/donations
 * @desc Fetch all active donation presets (PUBLIC)
 */
export const getDonations = asyncHandler(async (_req: Request, res: Response) => {
  const query = `
    *[_type == "donation" && active == true] | order(order asc) {
      _id,
      _type,
      title,
      description,
      presetAmounts,
      allowCustomAmount,
      minAmount,
      "imageUrl": image.asset->url,
      active,
      order
    }
  `;

  const donations = await sanityClient.fetch(query);
  res.status(200).json(donations);
});

/**
 * @route GET /api/admin/donations/all
 * @desc Fetch ALL donation presets (ADMIN)
 */
export const getAllDonations = asyncHandler(async (_req: Request, res: Response) => {
  const query = `
    *[_type == "donation"] | order(order asc) {
      _id,
      _type,
      title,
      description,
      presetAmounts,
      allowCustomAmount,
      minAmount,
      "imageUrl": image.asset->url,
      active,
      order
    }
  `;

  const donations = await sanityClient.fetch(query);
  res.status(200).json(donations);
});

/**
 * @route POST /api/admin/donations
 * @desc Create a new donation preset (ADMIN)
 */
export const createDonation = asyncHandler(async (req: Request, res: Response) => {
  const { imageData, ...donationData } = req.body as Partial<Donation> & {
    imageData?: string;
  };

  const donationDoc: Partial<Donation> = donationData;

  // Handle image upload if provided
  if (imageData) {
    const base64Data = imageData.split(",")[1] || imageData;
    const buffer = Buffer.from(base64Data, "base64");

    const asset = await sanityClient.assets.upload("image", buffer, {
      contentType: "image/jpeg",
      filename: `donation-${Date.now()}.jpg`,
    });

    donationDoc.image = {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: asset._id,
      },
    };
  }

  const newDonation = await createDocument("donation", donationDoc as any);
  res.status(201).json(newDonation);
});

/**
 * @route PUT /api/admin/donations/:id
 * @desc Update a donation preset (ADMIN)
 */
export const updateDonation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { imageData, ...donationData } = req.body as Partial<Donation> & {
    imageData?: string;
  };

  const updates: Partial<Donation> = donationData;

  // Handle image upload if provided
  if (imageData) {
    const base64Data = imageData.split(",")[1] || imageData;
    const buffer = Buffer.from(base64Data, "base64");

    const asset = await sanityClient.assets.upload("image", buffer, {
      contentType: "image/jpeg",
      filename: `donation-${Date.now()}.jpg`,
    });

    updates.image = {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: asset._id,
      },
    };
  }

  const updatedDonation = await updateDocument(id, updates as any);
  res.status(200).json(updatedDonation);
});

/**
 * @route DELETE /api/admin/donations/:id
 * @desc Delete a donation preset (ADMIN)
 */
export const deleteDonation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteDocument(id);
  res.status(200).json({ message: "Donation deleted successfully" });
});
