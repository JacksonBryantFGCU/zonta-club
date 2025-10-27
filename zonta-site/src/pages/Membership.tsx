import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchPublicMemberships, submitMembershipApplication } from "../queries/membershipPublicQueries";

export default function Membership() {
  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ["public-memberships"],
    queryFn: fetchPublicMemberships,
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const mutation = useMutation({
    mutationFn: submitMembershipApplication,
    onSuccess: () => {
      alert("✅ Application submitted successfully!");
      setSelected(null);
      setFormData({ name: "", email: "", message: "" });
    },
    onError: () => alert("❌ Failed to submit application."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    mutation.mutate({ ...formData, membershipId: selected });
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-zontaGold/10 to-white text-center px-6 py-16">
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
          Join the <span className="font-semibold text-zontaRed">Zonta Club of Naples</span> — 
          empowering women through service and advocacy.
        </p>
      </motion.div>

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
              <p className="text-lg font-semibold text-zontaGold mb-3">${m.price.toFixed(2)}</p>
              <ul className="text-sm text-gray-700 mb-4 text-left">
                {m.benefits?.map((b, i) => (
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

      {/* ===== Modal for Signup ===== */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md text-left"
          >
            <h2 className="text-xl font-bold text-zontaRed mb-4">
              Membership Application
            </h2>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full border rounded-md px-3 py-2 mb-3"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full border rounded-md px-3 py-2 mb-3"
            />
            <textarea
              placeholder="Why do you want to join?"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full border rounded-md px-3 py-2 mb-3"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-gray-600 hover:text-zontaRed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-2 bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
              >
                {mutation.isPending ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}