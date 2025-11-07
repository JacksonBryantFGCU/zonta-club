// zonta-site/src/components/CartDrawer.tsx

import { useContext } from "react";
import { motion } from "framer-motion";
import { CartContext } from "../context/CartContext";

export default function CartDrawer() {
  const { items, removeItem, clearCart, total, toggleCart } = useContext(CartContext)!;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed top-0 right-0 w-80 md:w-96 h-full bg-white shadow-2xl border-l border-zontaGold z-50 flex flex-col"
    >
      <div className="flex justify-between items-center p-4 border-b border-zontaGold">
        <h2 className="text-2xl font-bold text-zontaRed">Your Cart</h2>
        <button onClick={toggleCart} className="text-zontaDark hover:text-zontaRed">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <p className="text-center text-zontaDark/70">Your cart is empty.</p>
        ) : (
          items.map((item) => (
            <div key={item._id} className="flex items-center gap-3 border-b pb-3">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-zontaRed">{item.title}</h3>
                <p className="text-sm text-zontaDark/70">
                  ${item.price.toFixed(2)} × {item.quantity}
                </p>
              </div>
              <button
                onClick={() => removeItem(item._id)}
                className="text-sm text-zontaDark hover:text-zontaRed"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="p-4 border-t border-zontaGold">
          <p className="font-semibold text-zontaDark mb-3">
            Total: ${total.toFixed(2)}
          </p>
          <button
            onClick={clearCart}
            className="w-full bg-zontaRed text-white py-2 rounded-lg font-semibold hover:bg-zontaDark transition"
          >
            Checkout (Coming Soon)
          </button>
        </div>
      )}
    </motion.div>
  );
}