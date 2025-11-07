// zonta-site/src/pages/Scholarships.tsx

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HeroImage from "../assets/hero_women_empowerment.jpg";

const fetchPublicScholarships = async () => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scholarships`);
  if (!res.ok) throw new Error("Failed to fetch scholarships");
  return res.json();
};

interface Scholarship {
  _id: string;
  title: string;
  description?: string;
  eligibility?: string[];
  amount?: number;
  deadline?: string;
  imageUrl?: string;
}

export default function Scholarships() {
  const navigate = useNavigate();

  const {
    data: scholarships = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-scholarships"],
    queryFn: fetchPublicScholarships,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <main className="flex flex-col items-center text-center overflow-hidden -mt-4">
      {/* ===== Hero Section ===== */}
      <section className="relative w-full min-h-[60vh] flex flex-col justify-center items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HeroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-zontaGold/70 mix-blend-multiply"></div>

        <div className="relative z-10 max-w-3xl px-6 text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 drop-shadow-md">
            Scholarships & Opportunities
          </h1>
          <p className="text-lg sm:text-xl bg-white/70 text-zontaDark px-6 py-3 rounded-lg shadow-md font-medium">
            The Zonta Club of Naples supports women through education and
            service. Explore active scholarships below and apply directly online.
          </p>
        </div>
      </section>

      {/* ===== Scholarships Section ===== */}
      <section className="py-20 px-6 bg-white text-zontaDark max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-zontaRed mb-10">
          Current Scholarships
        </h2>

        {isLoading ? (
          <p className="text-zontaDark/70">Loading scholarships...</p>
        ) : isError ? (
          <p className="text-red-600">Failed to load scholarships.</p>
        ) : scholarships.length === 0 ? (
          <p className="text-zontaDark/70">
            No active scholarships are currently available.
          </p>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((scholarship: Scholarship) => (
              <motion.div
                key={scholarship._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-zontaGold rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                {scholarship.imageUrl && (
                  <img
                    src={scholarship.imageUrl}
                    alt={scholarship.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6 flex flex-col flex-grow text-left">
                  <h3 className="text-2xl font-semibold text-zontaRed mb-2">
                    {scholarship.title}
                  </h3>
                  <p className="text-zontaDark/80 text-sm mb-3">
                    {scholarship.description}
                  </p>

                  {scholarship.amount && (
                    <p className="text-sm font-semibold text-zontaGold mb-2">
                      Award: ${scholarship.amount.toLocaleString()}
                    </p>
                  )}

                  {scholarship.deadline && (
                    <p className="text-sm text-zontaDark/80 mb-3">
                      Deadline:{" "}
                      {new Date(scholarship.deadline).toLocaleDateString()}
                    </p>
                  )}

                  {scholarship.eligibility && (
                    <ul className="text-sm list-disc list-inside mb-4 text-zontaDark/70">
                      {scholarship.eligibility.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() =>
                      navigate(`/scholarships/apply/${scholarship._id}`)
                    }
                    className="mt-auto bg-zontaGold text-white px-5 py-2 rounded-md hover:bg-zontaRed transition"
                  >
                    Apply Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}