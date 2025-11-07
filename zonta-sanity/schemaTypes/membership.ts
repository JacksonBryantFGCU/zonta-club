// zonta-sanity/schemaTypes/membership.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "membership",
  title: "Membership",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Membership Type",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price (USD)",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "benefits",
      title: "Benefits",
      type: "array",
      of: [{ type: "string" }],
      description: "List of member benefits",
    }),
    defineField({
      name: "duration",
      title: "Duration (months)",
      type: "number",
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "isActive",
      title: "Active?",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
    }),
  ],
  orderings: [
    {
      title: "Order Ascending",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});