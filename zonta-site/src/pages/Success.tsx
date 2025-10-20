import { useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { CartContext } from "../context/CartContext";

export default function Success() {
  const { clearCart } = useContext(CartContext)!;

  // 🧹 Clear cart on success
  useEffect(() => {
    clearCart?.();
  }, [clearCart]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[85vh] text-center px-6 bg-gradient-to-b from-gray-50 to-white"
    >
      {/* ✅ Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="mb-6"
      >
        <CheckCircle className="text-green-500 w-20 h-20 mx-auto" />
      </motion.div>

      {/* 🏷️ Title & Message */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-bold text-gray-800 mb-3"
      >
        Thank you for your purchase!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-gray-600 max-w-md mb-8"
      >
        Your payment was processed successfully.  
        You’ll receive an email confirmation shortly with your order details.
      </motion.p>

      {/* 🧾 Subtle Success Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white shadow-lg rounded-xl p-6 max-w-md w-full mb-10 border border-gray-100"
      >
        <div className="flex flex-col items-center text-gray-700 space-y-3">
          <ShoppingBag className="text-zontaRed w-10 h-10" />
          <p className="text-base font-medium">
            We’re preparing your order for fulfillment.
          </p>
          <p className="text-sm text-gray-500">
            You’ll be notified once it’s on the way!
          </p>
        </div>
      </motion.div>

      {/* 🔗 Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <button
  onClick={() => window.location.assign("/ecommerce")}
  className="flex items-center gap-2 px-6 py-2 bg-zontaGold text-white font-medium rounded-lg shadow hover:bg-yellow-700 transition"
>
  Continue Shopping
</button>
<button
  onClick={() => window.location.assign("/")}
  className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
>
  <Home size={18} />
  Back to Home
</button>
        
      </motion.div>

      {/* 💛 Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-12 text-sm text-gray-500"
      >
        Thank you for supporting the{" "}
        <span className="text-zontaRed font-semibold">Zonta Club of Naples</span> 💛
      </motion.footer>
    </motion.div>
  );
}