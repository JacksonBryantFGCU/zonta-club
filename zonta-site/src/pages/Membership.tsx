// zonta-site/src/pages/Membership.tsx

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
                onClick={() => navigate(`/membership/apply/${m._id}`)}
                className="bg-zontaGold text-white px-5 py-2 rounded-md hover:bg-zontaRed transition"
              >
                Join Now
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}