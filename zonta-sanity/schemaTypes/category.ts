export default {
  name: "category",
  title: "Categories",
  type: "document",
  fields: [
    { name: "title", title: "Category Name", type: "string", validation: (Rule: any) => Rule.required() },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
  ]
};
