<<<<<<< HEAD
// Scholarships.tsx
export default function Scholarships() {
  return <div className="p-10 text-center">Scholarship Information Coming Soon</div>;
=======
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HeroImage from "../assets/hero_women_empowerment.jpg";

// === Public API Queries ===
const fetchPublicScholarships = async () => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scholarships`);
  if (!res.ok) throw new Error("Failed to fetch scholarships");
  return res.json();
};

interface ScholarshipApplicationData {
  name: string;
  email: string;
  phone?: string;
  gpa?: string;
  essay: string;
  scholarshipId: string;
}

const submitScholarshipApplication = async (data: ScholarshipApplicationData) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scholarships/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit scholarship application");
  return res.json();
};

interface Scholarship {
  _id: string;
  title: string;
  description?: string;
  eligibility?: string[];
  amount?: number;
  deadline?: string;
  applyInstructions?: string;
  contactEmail?: string;
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

  const [selected, setSelected] = useState<Scholarship | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gpa: "",
    essay: "",
  });

  const mutation = useMutation({
    mutationFn: submitScholarshipApplication,
    onSuccess: () => {
      setSelected(null);
      setFormData({ name: "", email: "", phone: "", gpa: "", essay: "" });
      navigate("/success?type=scholarship");
    },
    onError: () => alert("❌ Failed to submit application. Please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    mutation.mutate({
      ...formData,
      scholarshipId: selected._id,
    });
  };

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
                      💰 Award: ${scholarship.amount.toLocaleString()}
                    </p>
                  )}

                  {scholarship.deadline && (
                    <p className="text-sm text-zontaDark/80 mb-3">
                      🗓️ Deadline:{" "}
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
                    onClick={() => setSelected(scholarship)}
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

      {/* ===== Application Modal ===== */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md text-left"
          >
            <h2 className="text-xl font-bold text-zontaRed mb-4">
              Apply for {selected.title}
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
            <input
              type="text"
              placeholder="Phone Number (optional)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border rounded-md px-3 py-2 mb-3"
            />
            <input
              type="number"
              placeholder="GPA (optional)"
              step="0.01"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              className="w-full border rounded-md px-3 py-2 mb-3"
            />
            <textarea
              placeholder="Short Essay or Motivation"
              rows={4}
              value={formData.essay}
              onChange={(e) => setFormData({ ...formData, essay: e.target.value })}
              className="w-full border rounded-md px-3 py-2 mb-4"
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
                className="px-4 py-2 bg-zontaGold text-white rounded-md hover:bg-zontaRed transition disabled:opacity-50"
              >
                {mutation.isPending ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
>>>>>>> admin-update
}