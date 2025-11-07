// zonta-sanity/schemaTypes/orderItem.ts

export default {
  name: "orderItem",
  title: "Order Item",
  type: "object",
  fields: [
    {
      name: "productName",
      title: "Product Name",
      type: "string",
    },
    {
      name: "quantity",
      title: "Quantity",
      type: "number",
    },
    {
      name: "price",
      title: "Price (USD)",
      type: "number",
    },
  ],
};