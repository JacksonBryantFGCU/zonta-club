// Membership.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fetchPublicMemberships } from "../queries/membershipPublicQueries";

export default function Membership() {
  const navigate = useNavigate();
  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ["public-memberships"],
    queryFn: fetchPublicMemberships,
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/memberships/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            membershipId: selected,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "❌ Failed to submit membership application.");
        setIsSubmitting(false);
        return;
      }

      // ✅ Redirect to Stripe Checkout OR success page
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // If no checkout link (approval required), go to success
        navigate("/success?type=membership");
      }
    } catch (err) {
      console.error("Error submitting membership:", err);
      alert("❌ An error occurred while submitting. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-zontaGold/10 to-white text-center px-6 py-16">
      {/* ===== Hero ===== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-zontaRed mb-4">
          Become a Member
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          Join the{" "}
          <span className="font-semibold text-zontaRed">
            Zonta Club of Naples
          </span>{" "}
          — empowering women through service and advocacy.
        </p>
      </motion.div>

      {/* ===== Membership Cards ===== */}
      {isLoading ? (
        <p className="text-gray-500">Loading memberships...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {memberships.map((m) => (
            <motion.div
              key={m._id}
              whileHover={{ scale: 1.03 }}
              className="bg-white border border-zontaGold rounded-xl shadow-md p-6 flex flex-col items-center"
            >
              <h3 className="text-xl font-bold text-zontaRed mb-2">{m.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{m.description}</p>
              <p className="text-lg font-semibold text-zontaGold mb-3">
                ${m.price.toFixed(2)}
              </p>
              <ul className="text-sm text-gray-700 mb-4 text-left">
                {m.benefits?.map((b: string, i: number) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
              <button
                onClick={() => setSelected(m._id)}
                className="bg-zontaGold text-white px-5 py-2 rounded-md hover:bg-zontaRed transition"
              >
                Join Now
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* ===== Modal Form ===== */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md text-left"
          >
            <h2 className="text-xl font-bold text-zontaRed mb-4">
              Membership Application
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2"
              />
              <textarea
                placeholder="Why do you want to join?"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={3}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setFormData({ name: "", email: "", phone: "", message: "" });
                }}
                className="px-4 py-2 text-gray-600 hover:text-zontaRed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-zontaGold text-white rounded-md hover:bg-zontaRed transition disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Apply & Pay"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}