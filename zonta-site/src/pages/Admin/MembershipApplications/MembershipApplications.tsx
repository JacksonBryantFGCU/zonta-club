// zonta-site/src/pages/Admin/MembershipApplications/MembershipApplications.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMembershipApplications,
  updateMembershipApplicationStatus,
  deleteMembershipApplication,
  createMembershipPaymentLink,
  type MembershipApplication,
} from "../../../queries/membershipApplicationQueries";

import ViewApplicationModal from "./ViewApplicationModal";
import UpdateStatusModal from "./UpdateStatusModal";

export default function MembershipApplications() {
  const queryClient = useQueryClient();

  const [selectedApp, setSelectedApp] = useState<MembershipApplication | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Fetch data
  const {
    data: applications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "membershipApplications"],
    queryFn: fetchMembershipApplications,
    staleTime: 60_000,
  });

  // Update status
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

  // Delete application
  const deleteMutation = useMutation({
    mutationFn: deleteMembershipApplication,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "membershipApplications"],
      }),
  });

  // Create payment link
  const generatePaymentLinkMutation = useMutation({
    mutationFn: (id: string) => createMembershipPaymentLink(id),
    onSuccess: (data) => {
      alert(`Payment link generated:\n\n${data.checkoutUrl}`);
      navigator.clipboard.writeText(data.checkoutUrl);
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
    if (confirm(`Delete application for "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* HEADER */}
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

      {/* STATES */}
      {isLoading && (
        <p className="text-center py-8 text-gray-500">
          Loading applications...
        </p>
      )}

      {isError && (
        <p className="text-center py-8 text-red-500">
          Failed to load applications.
        </p>
      )}

      {!isLoading && !isError && applications.length === 0 && (
        <p className="text-gray-600 text-sm">No applications found.</p>
      )}

      {/* CARD LIST */}
      <div className="space-y-6">
        {applications.map((app) => {
          const price = app.membershipType?.price ?? 0;
          const isFreeTier = price === 0;
          const showPaymentLink =
            !isFreeTier && !app.paid && app.status !== "rejected";

          const safeStatus = app.status ?? "pending";

          const statusColor =
            safeStatus === "approved"
              ? "bg-green-100 text-green-700"
              : safeStatus === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700";

          return (
            <div
              key={app._id}
              className="border border-zontaGold rounded-xl p-5 bg-white shadow-sm"
            >
              {/* NAME */}
              <p className="text-lg font-semibold text-zontaMahogany">
                {app.name}
              </p>
              <p className="text-gray-700">{app.email}</p>

              {/* MEMBERSHIP */}
              <div className="mt-2">
                <p className="font-semibold text-zontaMahogany">
                  Membership: {app.membershipType?.title ?? "N/A"}
                </p>

                {isFreeTier ? (
                  <p className="text-green-600 text-sm font-semibold">
                    Free Tier
                  </p>
                ) : (
                  <p className="text-zontaGold text-sm font-semibold">
                    ${price.toFixed(2)}
                  </p>
                )}
              </div>

              {/* STATUS */}
              <div className="mt-3">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${statusColor}`}
                >
                  {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-2 mt-4">
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

                {showPaymentLink && (
                  <button
                    onClick={() =>
                      generatePaymentLinkMutation.mutate(app._id)
                    }
                    className="px-3 py-1 text-xs bg-zontaMahogany text-white rounded-md hover:bg-zontaRed transition"
                  >
                    Payment Link
                  </button>
                )}

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

      {/* MODALS */}
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