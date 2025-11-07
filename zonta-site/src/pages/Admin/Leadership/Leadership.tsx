// zonta-site/src/pages/Admin/Leadership/Leadership.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchLeadership,
  createLeader,
  updateLeader,
  deleteLeader,
} from "../../../queries/leadershipQueries";
import AddLeaderModal from "./AddLeaderModal";
import EditLeaderModal, { type Leader } from "./EditLeaderModal";

export default function Leadership() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  const { data: leaders = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin", "leadership"],
    queryFn: fetchLeadership,
    staleTime: 60_000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createLeader,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "leadership"] });
      setIsAddModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Leader> }) =>
      updateLeader(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "leadership"] });
      setIsEditModalOpen(false);
      setSelectedLeader(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLeader,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "leadership"] });
    },
  });

  // Handlers
  const handleEdit = (leader: Leader) => {
    setSelectedLeader(leader);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading)
    return <p className="text-center text-gray-500 py-8">Loading leadership...</p>;

  if (isError)
    return (
      <div className="text-center text-red-600 py-8">
        <p>Failed to load leadership.</p>
        <p className="text-sm text-gray-500 mt-2">
          {(error as Error)?.message ?? "Unknown error"}
        </p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-zontaRed">Leadership Team</h2>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-zontaGold text-white rounded-md shadow hover:bg-zontaRed transition"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Leader
          </button>
          <button
            className="px-4 py-2 bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["admin", "leadership"] })
            }
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Leadership Table */}
      {leaders.length === 0 ? (
        <p className="text-gray-600 text-sm">No leadership members found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-zontaGold text-sm">
            <thead className="bg-zontaGold text-white">
              <tr>
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Bio</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader) => (
                <tr
                  key={leader._id}
                  className="border-b border-zontaGold/40 hover:bg-zontaGold/10"
                >
                  <td className="px-4 py-2">
                    {leader.imageUrl ? (
                      <img
                        src={leader.imageUrl}
                        alt={leader.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium">{leader.name}</td>
                  <td className="px-4 py-2">{leader.role}</td>
                  <td className="px-4 py-2">
                    {leader.bio ? (
                      <span className="text-gray-600 text-xs line-clamp-2">
                        {leader.bio}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="px-3 py-1 text-xs bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
                      onClick={() => handleEdit(leader)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                      onClick={() => handleDelete(leader._id, leader.name)}
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
      <AddLeaderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(leader) => createMutation.mutate(leader)}
        isSubmitting={createMutation.isPending}
      />

      <EditLeaderModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLeader(null);
        }}
        onSubmit={(id, updates) => updateMutation.mutate({ id, updates })}
        isSubmitting={updateMutation.isPending}
        leader={selectedLeader}
      />
    </div>
  );
}
