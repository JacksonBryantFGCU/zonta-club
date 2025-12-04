// zonta-site/src/pages/MembershipApplication.tsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface Membership {
  _id: string;
  title: string;
  price?: number;
  description?: string;
}

const fetchMembershipById = async (id: string) => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/public/memberships/${id}`
  );
  if (!res.ok) throw new Error("Failed to fetch membership details");
  return res.json() as Promise<Membership | null>;
};

export default function MembershipApplication() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: membership,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["membership", id],
    queryFn: () => fetchMembershipById(id!),
    enabled: !!id,
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasPrice =
    typeof membership?.price === "number" && membership.price > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/public/memberships/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, membershipId: id }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit application.");

      // No Stripe redirect – admin will handle payment manually if needed
      navigate("/success?type=membership&status=submitted");
    } catch (err) {
      console.error("Error submitting membership:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-center py-20">Loading...</p>;
  }

  if (isError || !membership) {
    return (
      <p className="text-center py-20 text-red-600">
        Unable to load membership details. Please go back and try again.
      </p>
    );
  }

  return (
    <main className="py-16 px-6 min-h-screen bg-gradient-to-b from-zontaGold/10 to-white">
      <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-zontaGold/40 p-8 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-zontaRed mb-3">
          Apply for {membership.title}
        </h1>

        {membership.description && (
          <p className="text-gray-700 mb-4">{membership.description}</p>
        )}

        <div className="mb-6 text-sm text-gray-700 space-y-1">
          {hasPrice ? (
            <>
              <p className="font-semibold text-zontaGold">
                Membership Fee: ${membership.price!.toFixed(2)}
              </p>
              <p>
                You are submitting an application only. If your application is
                approved, the club will contact you with a payment link to
                complete your membership.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-zontaGold">
                This membership currently has no fee.
              </p>
              <p>
                Your application will be reviewed by our membership team. They
                will follow up with next steps.
              </p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full border border-zontaGold/40 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zontaGold/60"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full border border-zontaGold/40 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zontaGold/60"
          />
          <input
            type="tel"
            placeholder="Phone Number (optional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-zontaGold/40 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zontaGold/60"
          />
          <textarea
            placeholder="Why do you want to join?"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full border border-zontaGold/40 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zontaGold/60"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-zontaGold text-white py-3 rounded-md font-semibold hover:bg-zontaRed transition disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </section>
    </main>
  );
}