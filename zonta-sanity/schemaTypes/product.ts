// zonta-sanity/schemaTypes/product.ts

export default {
  name: "product",
  title: "Products",
  type: "document",
  fields: [
    { name: "title", title: "Product Name", type: "string", validation: (Rule: any) => Rule.required() },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
    { name: "price", title: "Price", type: "number", validation: (Rule: any) => Rule.required() },
    { name: "description", title: "Description", type: "text" },
    { name: "image", title: "Product Image", type: "image", options: { hotspot: true } },
    { name: "category", title: "Category", type: "reference", to: [{ type: "category" }] },
    { name: "inStock", title: "In Stock", type: "boolean", initialValue: true }
  ],
  preview: {
    select: { title: "title", media: "image", subtitle: "category.title" }
  }
};