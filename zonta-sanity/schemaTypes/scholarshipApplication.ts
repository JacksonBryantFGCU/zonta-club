// zonta-sanity/schemaTypes/scholarshipApplication.ts

import { defineType, defineField } from "sanity";

export default defineType({
  name: "scholarshipApplication",
  title: "Scholarship Application",
  type: "document",
  fields: [
    // 🔹 Applicant Info
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
    }),

    // 🔹 Scholarship reference
    defineField({
      name: "scholarship",
      title: "Scholarship",
      type: "reference",
      to: [{ type: "scholarship" }],
      validation: (Rule) => Rule.required(),
    }),

    // 🔹 Application content
    defineField({
      name: "essay",
      title: "Personal Essay or Statement",
      type: "text",
      rows: 8,
      description: "Applicant’s personal essay, motivation, or background statement.",
    }),

    defineField({
      name: "gpa",
      title: "Current GPA",
      type: "number",
      description: "Optional academic GPA for student applicants.",
    }),

    defineField({
      name: "references",
      title: "References",
      type: "array",
      of: [{ type: "string" }],
      description: "List of reference names or organizations.",
    }),

    // 🔹 Optional uploads
    defineField({
      name: "supportingDocuments",
      title: "Supporting Documents",
      type: "array",
      of: [{ type: "file" }],
      description: "Optional uploads (resume, transcripts, or letters of recommendation).",
    }),

    // 🔹 Admin workflow fields
    defineField({
      name: "status",
      title: "Application Status",
      type: "string",
      options: {
        list: ["pending", "approved", "rejected"],
        layout: "radio",
      },
      initialValue: "pending",
    }),

    defineField({
      name: "notes",
      title: "Admin Notes",
      type: "text",
      rows: 3,
      description: "Internal comments or review notes by the scholarship committee.",
    }),

    defineField({
      name: "createdAt",
      title: "Submitted On",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "scholarship.title",
      status: "status",
    },
    prepare(selection) {
      const { title, subtitle, status } = selection;
      return {
        title: title || "Unnamed Applicant",
        subtitle: `${subtitle ? subtitle + " — " : ""}${status ?? "pending"}`,
      };
    },
  },
});