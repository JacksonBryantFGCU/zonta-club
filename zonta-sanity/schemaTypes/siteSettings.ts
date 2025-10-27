import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "branding",
      title: "Branding",
      type: "object",
      fields: [
        { name: "siteTitle", title: "Site Title", type: "string" },
        { name: "mission", title: "Mission Statement", type: "text" },
        { name: "primaryHex", title: "Primary Hex", type: "string" }, // e.g. #B8860B
        { name: "accentHex", title: "Accent Hex", type: "string" },   // e.g. #8B0000
      ],
    }),
    defineField({
      name: "email",
      title: "Email / Notifications",
      type: "object",
      fields: [
        { name: "publicEmail", title: "Public Email", type: "string" },
        { name: "alertEmail", title: "Alert Email", type: "string" },
        {
          name: "sendReceipts",
          title: "Send Buyer Receipts?",
          type: "boolean",
        },
        {
          name: "sendNewOrderAlerts",
          title: "Send New Order Alerts?",
          type: "boolean",
        },
      ],
    }),
    defineField({
      name: "admins",
      title: "Admin Accounts",
      type: "array",
      of: [
        {
          type: "object",
          name: "adminUser",
          fields: [
            { name: "id", type: "string", title: "ID" },
            { name: "name", type: "string", title: "Name" },
            { name: "email", type: "string", title: "Email" },
            {
              name: "role",
              type: "string",
              title: "Role",
              options: {
                list: [
                  { title: "Full Access", value: "full" },
                  { title: "Read Only", value: "read" },
                ],
              },
            },
          ],
        },
      ],
    }),
    defineField({
      name: "updatedAt",
      title: "Last Updated",
      type: "datetime",
    }),
  ],
});