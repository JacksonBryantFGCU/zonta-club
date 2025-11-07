// zonta-site/src/pages/Admin/Scholarships.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} from "../../queries/scholarshipQueries";
import AddScholarshipModal, {
  type ScholarshipFormData,
} from "./Scholarships/AddScholarshipModal";
import EditScholarshipModal, { type Scholarship } from "./Scholarships/EditScholarshipModal";

export default function Scholarships() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] =
    useState<Scholarship | null>(null);

  const {
    data: scholarships = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "scholarships"],
    queryFn: fetchScholarships,
    staleTime: 60_000,
  });

  // Create scholarship mutation
  const createMutation = useMutation({
    mutationFn: createScholarship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "scholarships"] });
      setIsAddModalOpen(false);
    },
  });

  // Update scholarship mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: ScholarshipFormData;
    }) => updateScholarship(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "scholarships"] });
      setIsEditModalOpen(false);
      setSelectedScholarship(null);
    },
  });

  // Delete scholarship mutation
  const deleteMutation = useMutation({
    mutationFn: deleteScholarship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "scholarships"] });
    },
  });

  const handleEdit = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setIsEditModalOpen(true);
  };

  const handleDelete = (scholarshipId: string, scholarshipTitle: string) => {
    if (confirm(`Are you sure you want to delete "${scholarshipTitle}"?`)) {
      deleteMutation.mutate(scholarshipId);
    }
  };

  if (isLoading)
    return (
      <p className="text-center text-gray-500 py-8">Loading scholarships...</p>
    );
  if (isError)
    return (
      <p className="text-center text-red-600 py-8">
        Failed to load scholarships.
      </p>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-zontaRed">Scholarships</h2>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-zontaGold text-white rounded-md shadow hover:bg-zontaRed transition"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Scholarship
          </button>
          <button
            className="px-4 py-2 bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["admin", "scholarships"],
              })
            }
          >
            Refresh
          </button>
        </div>
      </div>

      {scholarships.length === 0 ? (
        <p className="text-gray-600 text-sm">No scholarships found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-zontaGold text-sm">
            <thead className="bg-zontaGold text-white">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Deadline</th>
                <th className="px-4 py-2 text-left">Eligibility</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scholarships.map((s) => (
                <tr
                  key={s._id}
                  className="border-b border-zontaGold/40 hover:bg-zontaGold/10"
                >
                  <td className="px-4 py-2 font-medium">{s.title}</td>
                  <td className="px-4 py-2">
                    {s.deadline
                      ? new Date(s.deadline).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {Array.isArray(s.eligibility)
                      ? s.eligibility.join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="px-3 py-1 text-xs bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
                      onClick={() => handleEdit({ ...s, description: s.description ?? "" })}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                      onClick={() => handleDelete(s._id, s.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <AddScholarshipModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(scholarship) => createMutation.mutate(scholarship)}
        isSubmitting={createMutation.isPending}
      />

      <EditScholarshipModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedScholarship(null);
        }}
        onSubmit={(id, updates) => updateMutation.mutate({ id, updates })}
        isSubmitting={updateMutation.isPending}
        scholarship={selectedScholarship}
      />
    </div>
  );
}
