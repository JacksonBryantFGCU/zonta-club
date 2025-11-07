// zonta-sanity/schemaTypes/scholarship.ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "scholarship",
  title: "Scholarship",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Scholarship Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      description: "Explain what this scholarship supports.",
    }),
    defineField({
      name: "eligibility",
      title: "Eligibility Requirements",
      type: "array",
      of: [{ type: "string" }],
      description: "List the basic eligibility criteria.",
    }),
    defineField({
      name: "deadline",
      title: "Application Deadline",
      type: "date",
    }),
    defineField({
      name: "applicationFile",
      title: "Application Form (PDF)",
      type: "file",
      options: {
        accept: ".pdf",
      },
      description: "Upload the downloadable PDF application form.",
    }),
    defineField({
      name: "image",
      title: "Scholarship Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Controls display order on the Scholarships page",
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});