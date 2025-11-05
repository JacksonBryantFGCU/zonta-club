<<<<<<< HEAD
export default function Ecommerce() {
  return <div className="p-10 text-center">Ecommerce Information Coming Soon</div>;
=======
import { useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, type Product } from "../queries/productQueries";
import { CartContext } from "../context/CartContext";
import { usePublicSettings } from "../queries/publicSettingsQueries";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

export default function Ecommerce() {
  const { totalItems } = useContext(CartContext)!;
  const navigate = useNavigate();
  const { data: settings } = usePublicSettings();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // ✅ Fetch products with React Query
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // ✅ Derived categories and filtered products
  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(unique) as string[];
  }, [products]);

  const filtered = useMemo(() => {
    let result = products;

    // Filter by search
    if (search.trim()) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    return result;
  }, [products, search, selectedCategory]);

  // ✅ Handle "shop disabled" setting
  if (settings && !settings.features.shopEnabled) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-zontaGold rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zontaRed mb-3">
            Shop Temporarily Unavailable
          </h2>
          <p className="text-gray-600 mb-6">
            Our online shop is currently closed. Please check back later or
            contact us for assistance.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-zontaGold text-white rounded-lg hover:bg-zontaRed transition-colors font-medium"
          >
            Return to Home
          </button>
        </div>
      </section>
    );
  }

  // ✅ Loading / Error states
  if (isLoading) {
    return (
      <div className="text-center py-20 text-zontaDark">
        Loading products...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-600">
        Failed to load products. Please try again later.
      </div>
    );
  }

  // ✅ Main product grid
  return (
    <section className="bg-white py-16 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* ===== Header Section ===== */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-4xl font-bold text-zontaDark text-center md:text-left">
            Zonta Club Store
          </h1>

          {/* 🛒 Cart Button */}
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 bg-zontaGold text-white px-6 py-3 rounded-lg shadow-md hover:bg-zontaDark transition"
          >
            View Cart
            {totalItems > 0 && (
              <span className="bg-white text-zontaRed font-bold px-2 py-0.5 rounded-md text-sm">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* ===== Filters ===== */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* ===== Products Grid ===== */}
        {filtered.length === 0 ? (
          <p className="text-center text-zontaDark/70 py-10">
            No products found.
          </p>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-zontaDark mb-6">
              Shop Products
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product: Product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
>>>>>>> admin-update
}