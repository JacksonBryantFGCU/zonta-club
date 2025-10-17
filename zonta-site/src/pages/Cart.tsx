import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const {
    items,
    removeItem,
    total,
    clearCart,
    addItem,
    decreaseItem, // ✅ quantity controls
  } = useContext(CartContext)!;

  const navigate = useNavigate();

  // ✅ Email + state management
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ Checkout handler
  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Simple email validation
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address before proceeding.");
        setLoading(false);
        return;
      }

      // Send cart data + email to backend
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, email }),
        }
      );

      if (!response.ok) throw new Error("Failed to create checkout session");

      const data = await response.json();

      if (data.url) {
        setSuccess("Redirecting to checkout...");
        window.location.href = data.url; // redirect to Stripe checkout
      } else {
        throw new Error("Invalid Stripe session URL");
      }
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Empty cart state
  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-zontaDark font-semibold mb-4">
          Your cart is empty.
        </h2>
        <button
          onClick={() => navigate("/ecommerce")}
          className="px-6 py-3 bg-zontaGold text-white rounded-lg hover:bg-zontaDark transition"
        >
          Back to Store
        </button>
      </div>
    );
  }

  // ✅ Main cart layout
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zontaRed mb-6 text-center">
          Your Cart
        </h1>

        {/* === Feedback Messages === */}
        {error && (
          <div className="mb-6 text-center text-red-600 bg-red-100 border border-red-300 py-2 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 text-center text-green-700 bg-green-100 border border-green-300 py-2 rounded-md">
            {success}
          </div>
        )}

        {/* === Cart Items === */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 gap-4"
            >
              <div className="flex items-center gap-4">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                <div>
                  <h2 className="font-semibold text-zontaDark">{item.title}</h2>
                  <p className="text-sm text-zontaDark/70">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
              </div>

              {/* ✅ Quantity Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => decreaseItem(item._id)}
                  className="w-8 h-8 flex items-center justify-center bg-zontaGold text-white rounded-md hover:bg-zontaDark transition"
                >
                  −
                </button>
                <span className="text-zontaDark font-semibold w-6 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => addItem(item)}
                  className="w-8 h-8 flex items-center justify-center bg-zontaGold text-white rounded-md hover:bg-zontaDark transition"
                >
                  +
                </button>
              </div>

              <div className="text-zontaDark font-medium text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                onClick={() => removeItem(item._id)}
                className="text-sm text-zontaRed hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* === Total + Email Form === */}
        <div className="text-right font-semibold text-xl text-zontaDark mb-6">
          Total: ${total.toFixed(2)}
        </div>

        {/* ✅ Email input section */}
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-zontaDark font-medium mb-2"
          >
            Email for receipt:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full md:w-1/2 border border-zontaGold rounded-lg px-4 py-2 text-zontaDark focus:outline-none focus:ring-2 focus:ring-zontaGold"
          />
        </div>

        {/* === Action Buttons === */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={clearCart}
            disabled={loading}
            className="px-6 py-3 border border-zontaRed text-zontaRed rounded-lg hover:bg-zontaRed hover:text-white transition disabled:opacity-50"
          >
            Clear Cart
          </button>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-6 py-3 bg-zontaGold text-white rounded-lg hover:bg-zontaDark transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </section>
  );
}