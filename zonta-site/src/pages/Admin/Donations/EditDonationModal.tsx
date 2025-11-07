// zonta-site/src/pages/Admin/Donations/EditDonationModal.tsx

import { useState, useEffect } from "react";

export interface Donation {
  _id: string;
  _type: "donation";
  title: string;
  description: string;
  presetAmounts: number[];
  allowCustomAmount: boolean;
  minAmount: number;
  imageUrl?: string;
  active: boolean;
  order: number;
}

interface EditDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<Donation> & { imageData?: string }) => void;
  isSubmitting: boolean;
  donation: Donation | null;
}

export default function EditDonationModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  donation,
}: EditDonationModalProps) {
  const [formData, setFormData] = useState<Partial<Donation>>({
    title: "",
    description: "",
    presetAmounts: [],
    allowCustomAmount: true,
    minAmount: 5,
    active: true,
    order: 0,
  });

  const [presetInput, setPresetInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  useEffect(() => {
    if (donation && isOpen) {
      setFormData({
        title: donation.title,
        description: donation.description,
        presetAmounts: donation.presetAmounts,
        allowCustomAmount: donation.allowCustomAmount,
        minAmount: donation.minAmount,
        active: donation.active,
        order: donation.order,
      });
      setImagePreview(donation.imageUrl || null);
      setImageChanged(false);
    }
  }, [donation, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageChanged(true);
  };

  const handleAddPreset = () => {
    const amount = parseFloat(presetInput);
    if (!isNaN(amount) && amount > 0) {
      setFormData((prev) => ({
        ...prev,
        presetAmounts: [...(prev.presetAmounts || []), amount].sort((a, b) => a - b),
      }));
      setPresetInput("");
    }
  };

  const handleRemovePreset = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      presetAmounts: (prev.presetAmounts || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donation) return;

    if ((formData.presetAmounts?.length ?? 0) === 0) {
      alert("Please add at least one preset amount");
      return;
    }

    const updates: Partial<Donation> & { imageData?: string } = { ...formData };

    if (imageChanged) {
      updates.imageData = imagePreview || undefined;
    }

    onSubmit(donation._id, updates);
  };

  if (!isOpen || !donation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-zontaDark">Edit Donation Preset</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="edit-donation-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-donation-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zontaGold"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-donation-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="edit-donation-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zontaGold"
              required
            />
          </div>

          {/* Preset Amounts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preset Amounts <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                value={presetInput}
                onChange={(e) => setPresetInput(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zontaGold"
                min="1"
                step="0.01"
              />
              <button
                type="button"
                onClick={handleAddPreset}
                className="px-4 py-2 bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.presetAmounts || []).map((amount, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-2"
                >
                  ${amount}
                  <button
                    type="button"
                    onClick={() => handleRemovePreset(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Allow Custom Amount */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowCustomAmount"
              checked={formData.allowCustomAmount}
              onChange={(e) =>
                setFormData({ ...formData, allowCustomAmount: e.target.checked })
              }
              className="w-4 h-4 text-zontaGold focus:ring-zontaGold"
            />
            <label htmlFor="allowCustomAmount" className="text-sm font-medium text-gray-700">
              Allow custom donation amounts
            </label>
          </div>

          {/* Minimum Amount */}
          {formData.allowCustomAmount && (
            <div>
              <label htmlFor="edit-donation-min-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Amount <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-donation-min-amount"
                type="number"
                value={formData.minAmount}
                onChange={(e) =>
                  setFormData({ ...formData, minAmount: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zontaGold"
                min="1"
                step="0.01"
                required
              />
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label htmlFor="edit-donation-image" className="block text-sm font-medium text-gray-700 mb-1">
              Image (Optional)
            </label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  aria-label="Remove image"
                >
                  ×
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById("edit-image-input")?.click()}
                  className="mt-2 px-3 py-1 bg-zontaGold text-white text-sm rounded hover:bg-zontaRed transition"
                >
                  Change Image
                </button>
                <input
                  id="edit-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  aria-label="Upload new image"
                />
              </div>
            ) : (
              <input
                id="edit-donation-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            )}
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-zontaGold focus:ring-zontaGold"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Active (visible on shop page)
            </label>
          </div>

          {/* Order */}
          <div>
            <label htmlFor="edit-donation-order" className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              id="edit-donation-order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zontaGold"
              min="0"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-zontaGold text-white rounded-md hover:bg-zontaRed transition disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Donation Preset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
