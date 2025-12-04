// zonta-site/src/pages/Ecommerce.tsx

import { useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, type Product } from "../queries/productQueries";
import { CartContext } from "../context/CartContext";
import { usePublicSettings } from "../queries/publicSettingsQueries";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import CategorySidebar from "../components/CategorySidebar";
import SortDropdown, { type SortOption } from "../components/SortDropdown";
import { useNavigate } from "react-router-dom";

export default function Ecommerce() {
  const { totalItems } = useContext(CartContext)!;
  const navigate = useNavigate();
  const { data: settings } = usePublicSettings();

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("name");

  // Mobile category dropdown toggle
  const [isCatOpen, setIsCatOpen] = useState(false);

  // Fetch products
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(true),
    staleTime: 1000 * 60 * 5,
  });

  // Dynamic category list
  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ) as string[];
  }, [products]);

  // Filtering + sorting
  const filtered = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.includes(p.category ?? "")
      );
    }

    switch (sortOption) {
      case "name":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [products, search, selectedCategories, sortOption]);

  // Shop disabled
  if (settings && !settings.features.shopEnabled) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-zontaRed mb-3">
            Shop Temporarily Unavailable
          </h2>
          <p className="text-gray-600 mb-6">
            Our online shop is currently closed. Please check back later.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-zontaGold text-white rounded-lg hover:bg-zontaRed transition font-medium"
          >
            Return to Home
          </button>
        </div>
      </section>
    );
  }

  // Loading / Error
  if (isLoading) {
    return <div className="text-center py-20 text-zontaDark">Loading...</div>;
  }
  if (isError) {
    return (
      <div className="text-center py-20 text-red-600">
        Failed to load products.
      </div>
    );
  }

  return (
    <section className="bg-white py-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex gap-10">

        {/* ===== SIDEBAR (DESKTOP) ===== */}
        <aside className="hidden md:block w-64 shrink-0">
          <CategorySidebar
            categories={categories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1">

          {/* ===== HEADER ===== */}
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <h1 className="text-4xl font-bold text-zontaDark">Zonta Club Store</h1>

            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 bg-zontaGold text-white px-6 py-3 rounded-lg shadow hover:bg-zontaDark transition"
            >
              View Cart
              {totalItems > 0 && (
                <span className="bg-white text-zontaRed font-bold px-2 py-0.5 rounded text-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* ===== MOBILE CATEGORY DROPDOWN ===== */}
          <div className="md:hidden mb-6 relative">
            <button
              onClick={() => setIsCatOpen((prev) => !prev)}
              className="w-full flex justify-between items-center px-4 py-3 bg-white border border-zontaGold/40 rounded-lg shadow-sm text-zontaDark font-medium"
            >
              Categories
              <span className="text-zontaGold font-bold">▼</span>
            </button>

            {isCatOpen && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-zontaGold/40 rounded-lg shadow-lg p-4">
                {categories.length === 0 && (
                  <p className="text-gray-500 text-sm">No categories found.</p>
                )}

                {categories.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 py-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => {
                        if (selectedCategories.includes(cat)) {
                          setSelectedCategories(
                            selectedCategories.filter((c) => c !== cat)
                          );
                        } else {
                          setSelectedCategories([
                            ...selectedCategories,
                            cat,
                          ]);
                        }
                      }}
                      className="h-4 w-4 text-zontaGold rounded border-zontaGold/60"
                    />
                    <span className="text-zontaDark">{cat}</span>
                  </label>
                ))}

                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="mt-3 w-full text-sm text-zontaRed font-semibold underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ===== SORT BAR ===== */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <p className="text-zontaDark text-lg">
              Showing <span className="font-semibold">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "item" : "items"}
            </p>

            <SortDropdown value={sortOption} onChange={setSortOption} />
          </div>

          {/* ===== SEARCH BAR ===== */}
          <div className="mb-6">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          {/* ===== PRODUCTS GRID ===== */}
          {filtered.length === 0 ? (
            <p className="text-center text-zontaDark/70 py-10">
              No products match your search or filters.
            </p>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product: Product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}