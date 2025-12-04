// zontasite/src/components/ProductCard.tsx

import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

export interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  category?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useContext(CartContext)!;

  return (
    <div className="bg-white border border-zontaGold/40 rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col">
      {/* PRODUCT IMAGE */}
      <div className="w-full h-48 bg-zontaGold/10 rounded-md flex items-center justify-center overflow-hidden mb-4">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <span className="text-gray-400 text-sm">No Image</span>
        )}
      </div>

      {/* TITLE + PRICE */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-zontaDark line-clamp-2 mb-1">
          {product.title}
        </h3>
        <p className="text-zontaRed font-semibold mb-4">${product.price.toFixed(2)}</p>
      </div>

      {/* BUTTONS */}
      <div className="flex flex-col gap-2 mt-2">
        {product.inStock ? (
          <button
            onClick={() => addItem(product)}
            className="w-full py-2 bg-zontaRed text-white rounded-md font-medium hover:bg-zontaDark transition"
          >
            Add to Cart
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}

        <Link
          to={`/product/${product._id}`}
          className="w-full text-center py-2 border border-zontaRed text-zontaRed rounded-md hover:bg-zontaRed hover:text-white transition font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}