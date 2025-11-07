// zonta-site/src/pages/Admin/Scholarhips/AddScholarshipModal.tsx

import { useState } from "react";
import { X } from "lucide-react";

interface AddScholarshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scholarship: ScholarshipFormData) => void;
  isSubmitting?: boolean;
}

export interface ScholarshipFormData {
  title: string;
  description: string;
  eligibility: string[];
  deadline: string;
  fileUrl?: string;
}

export default function AddScholarshipModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddScholarshipModalProps) {
  const [formData, setFormData] = useState<ScholarshipFormData>({
    title: "",
    description: "",
    eligibility: [],
    deadline: "",
    fileUrl: "",
  });

  const [eligibilityInput, setEligibilityInput] = useState("");

  const handleAddEligibility = () => {
    if (eligibilityInput.trim()) {
      setFormData({
        ...formData,
        eligibility: [...formData.eligibility, eligibilityInput.trim()],
      });
      setEligibilityInput("");
    }
  };

  const handleRemoveEligibility = (index: number) => {
    setFormData({
      ...formData,
      eligibility: formData.eligibility.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      eligibility: [],
      deadline: "",
      fileUrl: "",
    });
    setEligibilityInput("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-zontaRed">Add Scholarship</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Scholarship Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
              placeholder="Enter scholarship title"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent resize-none"
              placeholder="Enter scholarship description..."
              disabled={isSubmitting}
            />
          </div>

          {/* Deadline */}
          <div>
            <label
              htmlFor="scholarshipDeadline"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Application Deadline
            </label>
            <input
              id="scholarshipDeadline"
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Eligibility Criteria */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Eligibility Criteria
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={eligibilityInput}
                onChange={(e) => setEligibilityInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEligibility();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
                placeholder="Add eligibility requirement"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddEligibility}
                className="px-4 py-2 bg-zontaGold text-white rounded-lg hover:bg-zontaRed transition"
                disabled={isSubmitting}
              >
                Add
              </button>
            </div>
            {formData.eligibility.length > 0 && (
              <div className="space-y-2">
                {formData.eligibility.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEligibility(index)}
                      className="text-red-500 hover:text-red-700 transition"
                      disabled={isSubmitting}
                      aria-label={`Remove ${item}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Application Form URL
            </label>
            <input
              type="url"
              value={formData.fileUrl}
              onChange={(e) =>
                setFormData({ ...formData, fileUrl: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
              placeholder="https://example.com/application-form.pdf"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Link to downloadable application form
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-zontaGold text-white rounded-lg font-semibold hover:bg-zontaRed transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Scholarship"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
