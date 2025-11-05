import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface EditMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, membership: MembershipFormData) => void;
  isSubmitting?: boolean;
  membership: Membership | null;
}

export interface Membership {
  _id: string;
  title: string;
  price: number;
  description?: string;
  benefits?: string[];
  duration?: number;
  isActive?: boolean;
}

export interface MembershipFormData {
  title: string;
  price: number;
  description: string;
  benefits: string[];
  duration: number;
  isActive: boolean;
}

export default function EditMembershipModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  membership,
}: EditMembershipModalProps) {
  const [formData, setFormData] = useState<MembershipFormData>({
    title: "",
    price: 0,
    description: "",
    benefits: [],
    duration: 12,
    isActive: true,
  });

  const [benefitInput, setBenefitInput] = useState("");

  // Populate form when membership changes
  useEffect(() => {
    if (isOpen && membership) {
      setFormData({
        title: membership.title || "",
        price: membership.price || 0,
        description: membership.description || "",
        benefits: membership.benefits || [],
        duration: membership.duration || 12,
        isActive: membership.isActive ?? true,
      });
      setBenefitInput("");
    }
  }, [isOpen, membership]);

  const handleAddBenefit = () => {
    if (benefitInput.trim()) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, benefitInput.trim()],
      });
      setBenefitInput("");
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (membership) {
      onSubmit(membership._id, formData);
    }
  };

  if (!isOpen || !membership) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-zontaRed">Edit Membership</h2>
          <button
            onClick={onClose}
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
              Membership Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
              placeholder="Enter membership title"
              disabled={isSubmitting}
            />
          </div>

          {/* Price and Duration Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
                placeholder="0.00"
                disabled={isSubmitting}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (months) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
                placeholder="12"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent resize-none"
              placeholder="Enter membership description..."
              disabled={isSubmitting}
            />
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Membership Benefits
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBenefit();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
                placeholder="Add a benefit"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-4 py-2 bg-zontaGold text-white rounded-lg hover:bg-zontaRed transition"
                disabled={isSubmitting}
              >
                Add
              </button>
            </div>
            {formData.benefits.length > 0 && (
              <div className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{benefit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(index)}
                      className="text-red-500 hover:text-red-700 transition"
                      disabled={isSubmitting}
                      aria-label={`Remove ${benefit}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-zontaGold focus:ring-zontaGold border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <span className="text-sm font-semibold text-gray-700">
                Active (available for purchase)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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
              {isSubmitting ? "Updating..." : "Update Membership"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
