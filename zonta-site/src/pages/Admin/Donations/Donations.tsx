// zonta-site/src/pages/Admin/Donations/Donations.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDonationsAdmin,
  createDonation,
  updateDonation,
  deleteDonation,
  type Donation,
} from "../../../queries/donationQueries";
import AddDonationModal from "./AddDonationModal";
import EditDonationModal from "./EditDonationModal";

export default function Donations() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
    null
  );

  const {
    data: donations = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin", "donations"],
    queryFn: fetchDonationsAdmin,
    staleTime: 60_000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "donations"] });
      queryClient.invalidateQueries({ queryKey: ["donations"] }); // Also invalidate public cache
      setIsAddModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Donation> }) =>
      updateDonation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "donations"] });
      queryClient.invalidateQueries({ queryKey: ["donations"] }); // Also invalidate public cache
      setIsEditModalOpen(false);
      setSelectedDonation(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "donations"] });
      queryClient.invalidateQueries({ queryKey: ["donations"] }); // Also invalidate public cache
    },
  });

  // Handlers
  const handleEdit = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading)
    return (
      <p className="text-center text-gray-500 py-8">Loading donations...</p>
    );

  if (isError) {
    const errorMessage = (error as Error)?.message ?? "Unknown error";
    const isAuthError = errorMessage.includes("Invalid or expired token");

    return (
      <div className="text-center text-red-600 py-8">
        <p className="font-semibold">Failed to load donations.</p>
        <p className="text-sm text-gray-500 mt-2">{errorMessage}</p>
        {isAuthError && (
          <p className="text-sm text-blue-600 mt-3">
            Try logging out and logging back in to refresh your session.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-zontaRed">
          Donation Presets
        </h2>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-zontaGold text-white rounded-md shadow hover:bg-zontaRed transition"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Donation Preset
          </button>
        </div>
      </div>

      {/* Table */}
      {donations.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No donation presets yet. Create one to get started!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border-b font-semibold">Image</th>
                <th className="px-4 py-2 border-b font-semibold">Title</th>
                <th className="px-4 py-2 border-b font-semibold">
                  Preset Amounts
                </th>
                <th className="px-4 py-2 border-b font-semibold">
                  Custom Amount
                </th>
                <th className="px-4 py-2 border-b font-semibold">Status</th>
                <th className="px-4 py-2 border-b font-semibold">Order</th>
                <th className="px-4 py-2 border-b font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation) => (
                <tr
                  key={donation._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">
                    {donation.imageUrl ? (
                      <img
                        src={donation.imageUrl}
                        alt={donation.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium">{donation.title}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {donation.presetAmounts.map((amount, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                        >
                          ${amount}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {donation.allowCustomAmount ? (
                      <span className="text-green-600 text-sm">
                        ✓ Min: ${donation.minAmount}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">✗</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        donation.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {donation.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">{donation.order}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="px-3 py-1 text-xs bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
                      onClick={() => handleEdit(donation)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                      onClick={() => handleDelete(donation._id, donation.title)}
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
      <AddDonationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(donation) => createMutation.mutate(donation)}
        isSubmitting={createMutation.isPending}
      />

      <EditDonationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDonation(null);
        }}
        onSubmit={(id, updates) => updateMutation.mutate({ id, updates })}
        isSubmitting={updateMutation.isPending}
        donation={selectedDonation}
      />
    </div>
  );
}
