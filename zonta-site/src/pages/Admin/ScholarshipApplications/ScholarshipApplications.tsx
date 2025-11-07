// zonta-site/src/pages/Admin/ScholarhipApplications/ScholarshipApplications.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchScholarshipApplications,
  updateScholarshipApplicationStatus,
  deleteScholarshipApplication,
  type ScholarshipApplication,
} from "../../../queries/scholarshipApplicationQueries";
import ViewApplicationModal from "./ViewApplicationModal";
import UpdateStatusModal from "./UpdateStatusModal";

export default function ScholarshipApplications() {
  const queryClient = useQueryClient();

  const [selectedApp, setSelectedApp] = useState<ScholarshipApplication | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const {
    data: applications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "scholarshipApplications"],
    queryFn: fetchScholarshipApplications,
    staleTime: 60_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "pending" | "approved" | "rejected" }) =>
      updateScholarshipApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "scholarshipApplications"] });
      setIsStatusModalOpen(false);
      setSelectedApp(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScholarshipApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "scholarshipApplications"] });
    },
  });

  const handleView = (app: ScholarshipApplication) => {
    setSelectedApp(app);
    setIsViewModalOpen(true);
  };

  const handleUpdateStatus = (app: ScholarshipApplication) => {
    setSelectedApp(app);
    setIsStatusModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the application for "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-zontaRed">Scholarship Applications</h2>
        <button
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["admin", "scholarshipApplications"],
            })
          }
          className="px-4 py-2 bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition"
        >
          Refresh
        </button>
      </div>

      {/* Loading / Error / Empty */}
      {isLoading ? (
        <p className="text-center text-gray-500 py-8">Loading applications...</p>
      ) : isError ? (
        <p className="text-center text-red-500 py-8">Failed to load applications.</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-600 text-sm">No applications found.</p>
      ) : (
        <div className="grid gap-4">
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
                className="border border-zontaGold/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-zontaGold/5 transition"
              >
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-zontaRed text-lg">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-700">{app.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Scholarship: {app.scholarship?.title ?? "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted:{" "}
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColor}`}
                  >
                    {formattedStatus}
                  </span>
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
                    onClick={() => handleDelete(app._id, app.name)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
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