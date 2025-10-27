import { defineType, defineField } from "sanity";

export default defineType({
  name: "membershipApplication",
  title: "Membership Application",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "membershipType",
      title: "Membership Type",
      type: "reference",
      to: [{ type: "membership" }],
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "createdAt",
      title: "Submitted On",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
});