import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { CartContext } from "../context/CartContext";

export default function Success() {
  const { clearCart } = useContext(CartContext)!;
  const navigate = useNavigate();

  // 🧹 Clear cart and scroll to top on mount
  useEffect(() => {
    clearCart?.();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [clearCart]);

  // Helper to “reload” SPA routes
  const handleNavigate = (path: string) => {
    navigate(path, { replace: true });
    // Give a small delay so AnimatePresence completes exit animation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 150);
  };

  return (
    <motion.section
      className="flex flex-col items-center justify-center min-h-[85vh] text-center px-6 bg-gradient-to-b from-gray-50 to-white"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* ✅ Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="mb-6"
      >
        <CheckCircle className="text-green-500 w-20 h-20 mx-auto" />
      </motion.div>

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

      {/* 🔗 Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <button
          onClick={() => handleNavigate("/ecommerce")}
          className="flex items-center gap-2 px-6 py-2 bg-zontaGold text-white font-medium rounded-lg shadow hover:bg-yellow-700 transition"
        >
          Continue Shopping
        </button>

        <button
          onClick={() => handleNavigate("/")}
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
    </motion.section>
  );
}