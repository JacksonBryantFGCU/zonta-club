import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, deleteProduct } from "../../queries/productQueries";

interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  inStock?: boolean;
  category?: string | { _ref: string; _type: string };
}

export default function ProductsV2() {
  const queryClient = useQueryClient();

  // 🧠 Fetch all products
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery<Product[]>({
    queryKey: ["admin-v2", "products"],
    queryFn: fetchProducts,
    staleTime: 60_000,
  });

  // 🗑️ Delete mutation
  const mutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-v2", "products"] });
    },
  });

  // 🧩 Loading / Error States
  if (isLoading)
    return (
      <p className="text-center text-gray-500 py-8">
        Loading products from Sanity...
      </p>
    );

  if (isError)
    return (
      <div className="text-center text-red-600 py-8">
        <p>Failed to load products.</p>
        <p className="text-sm text-gray-500 mt-2">
          {(error as Error)?.message ?? "Unknown error"}
        </p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-zontaRed">Products</h2>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-zontaGold text-white rounded-md shadow hover:bg-zontaRed transition"
            onClick={() => alert("TODO: Open Add Product Modal")}
          >
            Add Product
          </button>
          <button
            className="px-4 py-2 bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["admin-v2", "products"] })
            }
          >
            Refresh List
          </button>
        </div>
      </div>

      {/* ===== Product Table ===== */}
      {products.length === 0 ? (
        <p className="text-gray-600 text-sm">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-zontaGold text-sm">
            <thead className="bg-zontaGold text-white">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                // ✅ Handle reference objects safely
                const category =
                  typeof p.category === "string"
                    ? p.category
                    : p.category && "_ref" in p.category
                    ? `Ref: ${p.category._ref.slice(0, 6)}…`
                    : "—";

                const price =
                  typeof p.price === "number"
                    ? `$${p.price.toFixed(2)}`
                    : typeof p.price === "string"
                    ? `$${p.price}`
                    : "—";

                return (
                  <tr
                    key={p._id}
                    className="border-b border-zontaGold/40 hover:bg-zontaGold/10"
                  >
                    <td className="px-4 py-2 font-medium">
                      {typeof p.title === "string"
                        ? p.title
                        : JSON.stringify(p.title)}
                    </td>
                    <td className="px-4 py-2">{price}</td>
                    <td className="px-4 py-2">{category}</td>
                    <td className="px-4 py-2">
                      {p.inStock ? (
                        <span className="text-green-600 font-medium">In Stock</span>
                      ) : (
                        <span className="text-red-600 font-medium">Out</span>
                      )}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="px-3 py-1 text-xs bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
                        onClick={() => alert(`Edit product ${p._id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                        onClick={() =>
                          confirm("Delete this product?") && mutation.mutate(p._id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}