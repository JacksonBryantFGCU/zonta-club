import { useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Confetti from "react-confetti";
import { CartContext } from "../context/CartContext";

export default function Success() {
  const { clearCart } = useContext(CartContext)!;
  const location = useLocation();

  // Optional: get order info from query params
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Clear cart on success
    clearCart?.();
  }, [clearCart]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
      <Confetti recycle={false} numberOfPieces={300} />

      <CheckCircle className="text-green-500 w-20 h-20 mb-4" />

      <h1 className="text-3xl font-semibold text-gray-800 mb-2">
        Thank you for your order!
      </h1>
      <p className="text-gray-600 mb-6">
        Your payment was successful.{" "}
        {orderId ? (
          <>
            Your order ID is{" "}
            <span className="font-semibold text-gray-800">{orderId}</span>.
          </>
        ) : (
          "You’ll receive a confirmation email shortly."
        )}
      </p>

      <div className="bg-white shadow-lg rounded-xl p-6 max-w-md w-full mb-8 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Order Summary
        </h2>
        <ul className="text-sm text-gray-600 space-y-1 mb-4">
          <li>• Items: <span className="font-medium">Shown in your email receipt</span></li>
          <li>• Status: <span className="text-yellow-600 font-medium">Pending</span></li>
          <li>• Total: <span className="font-medium">$XX.XX</span></li>
        </ul>
        <p className="text-sm text-gray-500 italic">
          We’ll notify you when your order has been fulfilled.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          to="/shop"
          className="px-6 py-2 bg-zonta-gold text-white rounded-lg hover:bg-yellow-700 transition"
        >
          Continue Shopping
        </Link>
        <Link
          to="/"
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          Back to Home
        </Link>
      </div>

      <footer className="mt-10 text-sm text-gray-500">
        Thank you for supporting the Zonta Club of Naples 💛
      </footer>
    </div>
  );
}