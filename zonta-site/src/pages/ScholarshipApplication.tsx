// zonta-site/src/pages/ScholarshipApplication.tsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

const fetchScholarshipById = async (id: string) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scholarships/${id}`);
  if (!res.ok) throw new Error("Failed to fetch scholarship details");
  return res.json();
};

const submitScholarshipApplication = async (data: unknown) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scholarships/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit application");
  return res.json();
};

export default function ScholarshipApplication() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: scholarship, isLoading } = useQuery({
    queryKey: ["scholarship", id],
    queryFn: () => fetchScholarshipById(id!),
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gpa: "",
    essay: "",
  });

  const mutation = useMutation({
    mutationFn: submitScholarshipApplication,
    onSuccess: () => navigate("/success?type=scholarship"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    mutation.mutate({ ...form, scholarshipId: id });
  };

  if (isLoading) return <p className="text-center py-20">Loading...</p>;

  return (
    <main className="py-20 px-6 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-zontaRed mb-6">
        Apply for {scholarship?.title}
      </h1>

      <p className="text-zontaDark mb-8">{scholarship?.description}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="text"
          placeholder="Phone Number (optional)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="number"
          placeholder="GPA (optional)"
          value={form.gpa}
          onChange={(e) => setForm({ ...form, gpa: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
        />
        <textarea
          placeholder="Essay or Motivation"
          rows={5}
          value={form.essay}
          onChange={(e) => setForm({ ...form, essay: e.target.value })}
          required
          className="w-full border rounded-md px-3 py-2"
        />

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-zontaGold text-white py-3 rounded-md hover:bg-zontaRed transition disabled:opacity-50"
        >
          {mutation.isPending ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </main>
  );
}
