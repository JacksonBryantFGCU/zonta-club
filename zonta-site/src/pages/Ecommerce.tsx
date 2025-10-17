import { useEffect, useState, useContext } from "react";
import { sanity } from "../lib/sanityClient";
import groq from "groq";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  category?: string;
}

export default function Ecommerce() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { totalItems } = useContext(CartContext)!; // ✅ improved logic
  const navigate = useNavigate();

  const query = groq`*[_type == "product"]{
    _id,
    title,
    price,
    description,
    inStock,
    "imageUrl": image.asset->url,
    "category": category->title
  } | order(title asc)`;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await sanity.fetch<Product[]>(query);
        setProducts(data);
        setFiltered(data);
        const uniqueCategories = Array.from(
          new Set(data.map((p) => p.category).filter(Boolean))
        );
        setCategories(uniqueCategories as string[]);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Filter products by search and category
  useEffect(() => {
    let filteredData = [...products];

    if (search.trim()) {
      filteredData = filteredData.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory) {
      filteredData = filteredData.filter((p) => p.category === selectedCategory);
    }

    setFiltered(filteredData);
  }, [search, selectedCategory, products]);

  if (loading) {
    return (
      <div className="text-center py-20 text-zontaDark">
        Loading products...
      </div>
    );
  }

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
            🛒 View Cart
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
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}