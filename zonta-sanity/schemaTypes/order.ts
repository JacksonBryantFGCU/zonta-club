export default {
  name: "order",
  title: "Orders",
  type: "document",
  fields: [
    {
      name: "email",
      title: "Customer Email",
      type: "string",
    },
    {
      name: "total",
      title: "Total ($)",
      type: "number",
    },
    {
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "Pending" },
          { title: "Completed", value: "Completed" },
          { title: "Cancelled", value: "Cancelled" },
        ],
        layout: "dropdown",
      },
    },
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
    },
    {
      name: "items",
      title: "Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "productName", type: "string" },
            { name: "quantity", type: "number" },
            { name: "price", type: "number" },
          ],
        },
      ],
    },
  ],

  preview: {
    select: {
      title: "email",
      subtitle: "status",
      total: "total",
    },
    prepare({ title, subtitle, total }: { title: string; subtitle: string; total: number }) {
      return {
        title,
        subtitle: `${subtitle || "Pending"} — $${total}`,
      };
    },
  },
};