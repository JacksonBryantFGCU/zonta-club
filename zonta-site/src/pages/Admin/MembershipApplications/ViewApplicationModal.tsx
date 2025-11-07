// zonta-site/src/pages/Admin/MembershipApplications/ViewApplicationModal.tsx

import { X } from "lucide-react";
import type { MembershipApplication } from "../../../queries/membershipApplicationQueries";

interface ViewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: MembershipApplication | null;
}

export default function ViewApplicationModal({
  isOpen,
  onClose,
  application,
}: ViewApplicationModalProps) {
  if (!isOpen || !application) return null;

  // Safe fallbacks for missing or null values
  const safeStatus = application.status ?? "pending";
  const formattedStatus =
    safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);
  const statusColor =
    safeStatus === "approved"
      ? "bg-green-100 text-green-700"
      : safeStatus === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-zontaRed">
            Application Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Close modal"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Application Info */}
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-y-2">
            <p>
              <strong className="text-gray-700">Name:</strong> {application.name}
            </p>
            <p>
              <strong className="text-gray-700">Email:</strong> {application.email}
            </p>
            {application.phone && (
              <p>
                <strong className="text-gray-700">Phone:</strong>{" "}
                {application.phone}
              </p>
            )}
            <p>
              <strong className="text-gray-700">Membership Type:</strong>{" "}
              {application.membershipType?.title ?? "N/A"}
            </p>
            <p>
              <strong className="text-gray-700">Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColor}`}
              >
                {formattedStatus}
              </span>
            </p>
            <p>
              <strong className="text-gray-700">Submitted:</strong>{" "}
              {application.createdAt
                ? new Date(application.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>

          {application.message && (
            <div className="pt-4">
              <strong className="text-gray-700 block mb-1">Message:</strong>
              <div className="bg-gray-50 p-3 rounded-lg text-gray-800 whitespace-pre-line">
                {application.message}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}