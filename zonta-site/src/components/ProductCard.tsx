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
    <div className="bg-zontaGold/10 border border-zontaGold rounded-lg shadow-md hover:shadow-lg transition">
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      )}
      <div className="p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zontaRed mb-1">
            {product.title}
          </h2>
          <p className="text-zontaDark/80 mb-2">${product.price.toFixed(2)}</p>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            disabled={!product.inStock}
            onClick={() => addItem(product)}
            className={`flex-1 py-2 rounded-md font-semibold transition ${
              product.inStock
                ? "bg-zontaRed text-white hover:bg-zontaDark"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>

          <Link
            to={`/product/${product._id}`}
            className="flex-1 py-2 text-center border border-zontaRed text-zontaRed rounded-md hover:bg-zontaRed hover:text-white transition font-semibold"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}