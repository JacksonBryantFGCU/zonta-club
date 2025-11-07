// zonta-sanity/schemaTypes/donation.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "donation",
  title: "Donation Presets",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "e.g., 'Support Our Mission' or 'General Donation'",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "Brief description of how donations help",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "presetAmounts",
      title: "Preset Amounts",
      type: "array",
      of: [{ type: "number" }],
      description: "Suggested donation amounts (e.g., 25, 50, 100, 250)",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "allowCustomAmount",
      title: "Allow Custom Amount",
      type: "boolean",
      description: "Allow donors to enter a custom amount",
      initialValue: true,
    }),
    defineField({
      name: "minAmount",
      title: "Minimum Amount",
      type: "number",
      description: "Minimum donation amount (if custom amounts allowed)",
      initialValue: 5,
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description: "Optional image for the donation section",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "Show donation section on the shop page",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which to display (lower numbers first)",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      active: "active",
      media: "image",
    },
    prepare({ title, active, media }) {
      return {
        title: title || "Untitled Donation",
        subtitle: active ? "Active" : "Inactive",
        media,
      };
    },
  },
});
