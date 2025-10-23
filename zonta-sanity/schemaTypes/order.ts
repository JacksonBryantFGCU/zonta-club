export default {
  name: "order",
  title: "Orders",
  type: "document",
  fields: [
    // 📧 Customer Email
    {
      name: "email",
      title: "Customer Email",
      type: "string",
      validation: (Rule: any) => Rule.required().email(),
    },

    // 👤 Customer Name
    {
      name: "customerName",
      title: "Customer Name",
      type: "string",
    },

    // 🏠 Shipping Address
    {
      name: "shippingAddress",
      title: "Shipping Address",
      type: "object",
      fields: [
        { name: "line1", title: "Address Line 1", type: "string" },
        { name: "city", title: "City", type: "string" },
        { name: "state", title: "State", type: "string" },
        { name: "postal_code", title: "Postal Code", type: "string" },
      ],
    },

    // 💵 Total
    {
      name: "total",
      title: "Total ($)",
      type: "number",
      validation: (Rule: any) => Rule.min(0).required(),
    },

    // 🚦 Status
    {
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "Pending" },
          { title: "Paid", value: "Paid" },
          { title: "Completed", value: "Completed" },
          { title: "Cancelled", value: "Cancelled" },
        ],
        layout: "dropdown",
      },
    },

    // 🕒 Created At
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
    },

    // 📦 Ordered Items
    {
      name: "items",
      title: "Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "productName", title: "Product Name", type: "string" },
            { name: "quantity", title: "Quantity", type: "number" },
            { name: "price", title: "Price ($)", type: "number" },
          ],
          preview: {
            select: { title: "productName", subtitle: "quantity" },
            prepare({ title, subtitle }: { title: string; subtitle: number }) {
              return { title, subtitle: `Qty: ${subtitle}` };
            },
          },
        },
      ],
    },

    // 📎 Receipt PDF
    {
      name: "receipt",
      title: "Receipt (PDF)",
      type: "file",
      options: {
        storeOriginalFilename: true,
      },
      fields: [
        {
          name: "description",
          type: "string",
          title: "Description",
          description: "Optional note about this receipt file.",
        },
      ],
    },
  ],

  // 🧭 Preview Settings
  preview: {
    select: {
      title: "email",
      subtitle: "status",
      total: "total",
      createdAt: "createdAt",
    },
    prepare({
      title,
      subtitle,
      total,
      createdAt,
    }: {
      title: string;
      subtitle: string;
      total: number;
      createdAt: string;
    }) {
      const date = createdAt
        ? new Date(createdAt).toLocaleDateString()
        : "No date";
      return {
        title: `${title || "No Email"}`,
        subtitle: `${subtitle || "Pending"} — $${total || 0} — ${date}`,
      };
    },
  },
};