import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMembershipApplications,
  updateMembershipApplicationStatus,
  deleteMembershipApplication,
  type MembershipApplication,
} from "../../../queries/membershipApplicationQueries";
import ViewApplicationModal from "./ViewApplicationModal";
import UpdateStatusModal from "./UpdateStatusModal";

export default function MembershipApplications() {
  const queryClient = useQueryClient();

  // ✅ Local UI state
  const [selectedApp, setSelectedApp] = useState<MembershipApplication | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // ✅ Fetch applications
  const {
    data: applications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "membershipApplications"],
    queryFn: fetchMembershipApplications,
    staleTime: 60_000,
  });

  // ✅ Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateMembershipApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "membershipApplications"],
      });
      setIsStatusModalOpen(false);
      setSelectedApp(null);
    },
  });

  // ✅ Delete membership application
  const deleteMutation = useMutation({
    mutationFn: deleteMembershipApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "membershipApplications"],
      });
    },
  });

  const handleView = (app: MembershipApplication) => {
    setSelectedApp(app);
    setIsViewModalOpen(true);
  };

  const handleUpdateStatus = (app: MembershipApplication) => {
    setSelectedApp(app);
    setIsStatusModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete the application for "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-zontaRed">
          Membership Applications
        </h2>
        <button
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["admin", "membershipApplications"],
            })
          }
          className="px-4 py-2 bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition"
        >
          Refresh
        </button>
      </div>

      {/* Loading / Error / Empty states */}
      {isLoading ? (
        <p className="text-center text-gray-500 py-8">
          Loading applications...
        </p>
      ) : isError ? (
        <p className="text-center text-red-500 py-8">
          Failed to load applications.
        </p>
      ) : applications.length === 0 ? (
        <p className="text-gray-600 text-sm">No applications found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-zontaGold text-sm">
            <thead className="bg-zontaGold text-white">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Membership Type</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                // ✅ Handle missing/null fields safely
                const safeStatus = app.status ?? "pending";
                const formattedStatus =
                  safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);
                const statusColor =
                  safeStatus === "approved"
                    ? "bg-green-100 text-green-700"
                    : safeStatus === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700";

                return (
                  <tr
                    key={app._id}
                    className="border-b border-zontaGold/40 hover:bg-zontaGold/10 transition"
                  >
                    <td className="px-4 py-2 font-medium">{app.name}</td>
                    <td className="px-4 py-2">{app.email}</td>
                    <td className="px-4 py-2">
                      {app.membershipType?.title ?? "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColor}`}
                      >
                        {formattedStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleView(app)}
                        className="px-3 py-1 text-xs bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app)}
                        className="px-3 py-1 text-xs bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() => handleDelete(app._id, app.name)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <ViewApplicationModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        application={selectedApp}
      />

      <UpdateStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={(status) => {
          if (selectedApp) {
            updateStatusMutation.mutate({ id: selectedApp._id, status });
          }
        }}
        isSubmitting={updateStatusMutation.isPending}
        currentStatus={selectedApp?.status ?? "pending"}
      />
    </div>
  );
}