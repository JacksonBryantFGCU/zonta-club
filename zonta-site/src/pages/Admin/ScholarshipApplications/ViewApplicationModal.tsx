// zonta-site/src/pages/Admin/ScholarhipApplications/ViewApplicationModal.tsx

import { X } from "lucide-react";
import type { ScholarshipApplication } from "../../../queries/scholarshipApplicationQueries";

interface ViewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ScholarshipApplication | null;
}

export default function ViewApplicationModal({
  isOpen,
  onClose,
  application,
}: ViewApplicationModalProps) {
  if (!isOpen || !application) return null;

  const { name, email, phone, gpa, essay, status, scholarship } = application;
  const safeStatus = status ?? "pending";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-zontaRed">
            Application Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 text-left">
          <p>
            <strong>Name:</strong> {name}
          </p>
          <p>
            <strong>Email:</strong> {email}
          </p>
          {phone && <p><strong>Phone:</strong> {phone}</p>}
          {gpa && <p><strong>GPA:</strong> {gpa}</p>}
          <p>
            <strong>Scholarship:</strong> {scholarship?.title ?? "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={
                safeStatus === "approved"
                  ? "text-green-600"
                  : safeStatus === "rejected"
                  ? "text-red-600"
                  : "text-yellow-600"
              }
            >
              {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
            </span>
          </p>

          {essay && (
            <div>
              <strong>Essay / Motivation:</strong>
              <p className="text-gray-700 mt-1 whitespace-pre-line border p-3 rounded-lg bg-gray-50">
                {essay}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
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