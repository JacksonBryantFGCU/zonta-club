// zonta-sanity/structure.ts

import { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      // Active Orders
      S.listItem()
        .title("Active Orders")
        .child(
          S.documentList()
            .title("Active Orders")
            .filter('_type == "order" && status != "Completed" && status != "Cancelled"')
            .defaultOrdering([{ field: "createdAt", direction: "desc" }])
        ),

      // Past Orders
      S.listItem()
        .title("Past Orders")
        .child(
          S.documentList()
            .title("Past Orders")
            .filter('_type == "order" && (status == "Completed" || status == "Cancelled")')
            .defaultOrdering([{ field: "createdAt", direction: "desc" }])
        ),

      // ... rest of your collections
      ...S.documentTypeListItems().filter(
        (item: any) => !["order"].includes(item.getId())
      ),
    ]);