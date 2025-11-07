// zonta-site/src/pages/Admin/Leadership/EditLeaderModal.tsx

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface EditLeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, leader: LeaderFormData) => void;
  isSubmitting?: boolean;
  leader: Leader | null;
}

export interface Leader {
  _id: string;
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
}

export interface LeaderFormData {
  name: string;
  role: string;
  bio: string;
  imageData?: string; // base64 encoded image
}

export default function EditLeaderModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  leader,
}: EditLeaderModalProps) {
  const [formData, setFormData] = useState<LeaderFormData>({
    name: "",
    role: "",
    bio: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  // Populate form when leader changes
  useEffect(() => {
    if (isOpen && leader) {
      setFormData({
        name: leader.name || "",
        role: leader.role || "",
        bio: leader.bio || "",
      });
      setImagePreview(leader.imageUrl || null);
      setImageChanged(false);
    }
  }, [isOpen, leader]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, imageData: base64String });
        setImageChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageData: undefined });
    setImageChanged(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leader) {
      // Only include imageData if image was changed
      const dataToSubmit = imageChanged
        ? formData
        : { ...formData, imageData: undefined };
      onSubmit(leader._id, dataToSubmit);
    }
  };

  if (!isOpen || !leader) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-zontaRed">Edit Leader</h2>
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
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
              placeholder="Enter leader name"
              disabled={isSubmitting}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role/Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
              placeholder="e.g., President, Vice President"
              disabled={isSubmitting}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Biography
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent resize-none"
              placeholder="Enter leader biography..."
              disabled={isSubmitting}
            />
          </div>

          {/* Leader Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Profile Image
            </label>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                  disabled={isSubmitting}
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById("editLeaderImage")?.click()}
                  className="absolute bottom-2 right-2 bg-zontaGold text-white px-3 py-1 rounded-md hover:bg-zontaRed transition text-sm"
                  disabled={isSubmitting}
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="editLeaderImage"
                  disabled={isSubmitting}
                  aria-label="Upload leader image"
                />
                <label
                  htmlFor="editLeaderImage"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">
                    Click to upload image
                  </span>
                  <span className="text-xs text-gray-400">
                    PNG, JPG up to 5MB
                  </span>
                </label>
              </div>
            )}
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
              {isSubmitting ? "Updating..." : "Update Leader"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
