import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    // ===============================
    // Maintenance Mode
    // ===============================
    defineField({
      name: "maintenance",
      title: "Maintenance Mode",
      type: "object",
      fields: [
        { name: "enabled", type: "boolean", title: "Enable Maintenance Mode" },
        {
          name: "message",
          type: "text",
          rows: 2,
          title: "Maintenance Message",
          description: "Shown when the site is temporarily unavailable.",
        },
      ],
    }),

    // ===============================
    // Announcement Banner
    // ===============================
    defineField({
      name: "announcement",
      title: "Homepage Announcement",
      type: "object",
      fields: [
        { name: "enabled", type: "boolean", title: "Show Banner?" },
        {
          name: "text",
          type: "string",
          title: "Banner Text",
          description: "Short message displayed on the homepage banner.",
        },
        { name: "link", type: "url", title: "Optional Link" },
      ],
    }),

    // ===============================
    // Feature Toggles
    // ===============================
    defineField({
      name: "features",
      title: "Feature Toggles",
      type: "object",
      fields: [
        {
          name: "shopEnabled",
          type: "boolean",
          title: "Enable Shop",
          initialValue: true,
        },
        {
          name: "donationsEnabled",
          type: "boolean",
          title: "Enable Donations",
          initialValue: true,
        },
      ],
    }),

    // ===============================
    // Admin Accounts (metadata only)
    // ===============================
    defineField({
      name: "admins",
      title: "Admin Accounts",
      type: "array",
      of: [
        {
          type: "object",
          name: "adminUser",
          title: "Admin User",
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
            {
              name: "active",
              type: "boolean",
              title: "Active",
              initialValue: true,
            },
          ],
        },
      ],
      description:
        "Admin metadata (roles and active state). Passwords are stored securely in the backend config, not here.",
    }),

    // ===============================
    // Last Updated
    // ===============================
    defineField({
      name: "updatedAt",
      type: "datetime",
      title: "Last Updated",
    }),
  ],
});