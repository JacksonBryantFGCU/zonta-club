// zonta-site/src/pages/ProductDetails.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { sanity } from "../lib/sanityClient";
import { CartContext } from "../context/CartContext";
import groq from "groq";
import type { Product } from "../components/ProductCard";

export default function ProductDetails() {
  const { id } = useParams(); // product _id from URL
  const navigate = useNavigate();
  const { addItem } = useContext(CartContext)!;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = groq`*[_type == "product" && _id == $id][0]{
      _id,
      title,
      price,
      description,
      inStock,
      "imageUrl": image.asset->url,
      "category": category->title
    }`;

    sanity.fetch<Product>(query, { id }).then((data) => {
      setProduct(data);
      setLoading(false);
    });
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-20 text-zontaDark">Loading product...</div>
    );

  if (!product)
    return (
      <div className="text-center py-20 text-zontaRed">
        Product not found.
        <br />
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-zontaGold text-white rounded-lg hover:bg-zontaDark"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        {/* ===== Product Image ===== */}
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4 md:p-8">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-auto max-h-[500px] object-contain rounded-lg"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
              <p className="text-zontaDark/70">No image available</p>
            </div>
          )}
        </div>

        {/* ===== Product Info ===== */}
        <div className="flex flex-col justify-center text-zontaDark">
          <h1 className="text-3xl font-bold text-zontaRed mb-4">
            {product.title}
          </h1>
          {product.category && (
            <p className="text-sm text-zontaDark/70 mb-2">
              Category: {product.category}
            </p>
          )}
          <p className="text-2xl font-semibold text-zontaGold mb-4">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {product.description || "No description available."}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => addItem(product)}
              disabled={!product.inStock}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                product.inStock
                  ? "bg-zontaRed text-white hover:bg-zontaDark"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-lg border border-zontaGold text-zontaDark hover:bg-zontaGold/20 transition"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}