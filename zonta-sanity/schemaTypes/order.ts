export default {
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    {
      name: "email",
      title: "Customer Email",
      type: "string",
    },
    {
      name: "total",
      title: "Total Amount",
      type: "number",
    },
    {
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "orderItem" }], // 👈 This line connects the two schemas
    },
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
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "Pending" },
          { title: "Shipped", value: "Shipped" },
          { title: "Delivered", value: "Delivered" },
        ],
      },
    },
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
    },
  ],
};