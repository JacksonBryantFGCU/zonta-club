// zonta-site/src/pages/Admin/MembershipApplication.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMembershipApplications,
  updateMembershipApplicationStatus,
  deleteMembershipApplication,
  type MembershipApplication,
} from "../../queries/membershipApplicationQueries";
import ViewApplicationModal from "./MembershipApplications/ViewApplicationModal";
import UpdateStatusModal from "./MembershipApplications/UpdateStatusModal";

export default function MembershipApplications() {
  const queryClient = useQueryClient();

  //  Local state
  const [selectedApp, setSelectedApp] = useState<MembershipApplication | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  //  Queries
  const {
    data: applications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "membershipApplications"],
    queryFn: fetchMembershipApplications,
    staleTime: 60_000,
  });

  //  Mutations
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

  const handleDelete = (app: MembershipApplication) => {
    if (
      confirm(
        `Are you sure you want to delete the application for "${app.name}"?`
      )
    ) {
      deleteMutation.mutate(app._id);
    }
  };

  //  Loading / error states
  if (isLoading)
    return (
      <p className="text-center text-gray-500 py-8">Loading applications...</p>
    );
  if (isError)
    return (
      <p className="text-center text-red-500 py-8">
        Failed to load applications.
      </p>
    );
  if (applications.length === 0)
    return <p className="text-gray-600 text-sm">No applications found.</p>;

  return (
    <div className="p-4 sm:p-6">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
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
                  <td className="px-4 py-2 flex gap-2">
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
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(app)}
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

      {/*  Mobile Card Layout */}
      <div className="grid md:hidden gap-4">
        {applications.map((app) => {
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
            <div
              key={app._id}
              className="border border-zontaGold/40 rounded-lg shadow-sm p-4 bg-white space-y-3"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-base font-semibold text-zontaRed">
                  {app.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColor}`}
                >
                  {formattedStatus}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                <strong>Email:</strong> {app.email}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Membership:</strong>{" "}
                {app.membershipType?.title ?? "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Date:</strong>{" "}
                {app.createdAt
                  ? new Date(app.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleView(app)}
                  className="flex-1 py-2 text-xs bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
                >
                  View
                </button>
                <button
                  onClick={() => handleUpdateStatus(app)}
                  className="flex-1 py-2 text-xs bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(app)}
                  className="flex-1 py-2 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
