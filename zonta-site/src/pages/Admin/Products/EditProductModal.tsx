// zonta-site/src/pages/Admin/Products/EditProductModal.tsx

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  createCategory,
  type Category,
} from "../../../queries/categoryQueries";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, product: ProductFormData) => void;
  isSubmitting?: boolean;
  product: Product | null;
}

export interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  categoryId?: string;
  categoryTitle?: string;
}

export interface ProductFormData {
  title: string;
  price: number;
  description: string;
  inStock: boolean;
  category?: string;
  imageData?: string; // base64 encoded image
}

export default function EditProductModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  product,
}: EditProductModalProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    price: 0,
    description: "",
    inStock: true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: fetchCategories,
    staleTime: 60_000,
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setFormData({ ...formData, category: newCategory._id });
      setNewCategoryName("");
      setShowNewCategoryInput(false);
    },
    onError: (error: Error) => {
      alert(`Failed to create category: ${error.message}`);
    },
  });

  // Populate form when product changes
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        title: product.title || "",
        price: product.price || 0,
        description: product.description || "",
        inStock: product.inStock ?? true,
        category: product.categoryId,
      });
      setImagePreview(product.imageUrl || null);
      setImageChanged(false);
      setShowNewCategoryInput(false);
      setNewCategoryName("");
    }
  }, [isOpen, product]);

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
    if (product) {
      // Only include imageData if image was changed
      const dataToSubmit = imageChanged
        ? formData
        : { ...formData, imageData: undefined };
      onSubmit(product._id, dataToSubmit);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-zontaRed">Edit Product</h2>
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
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
              placeholder="Enter product name"
              disabled={isSubmitting}
            />
          </div>

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
                setFormData({ ...formData, price: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
              placeholder="0.00"
              disabled={isSubmitting}
            />
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
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent resize-none"
              placeholder="Enter product description..."
              disabled={isSubmitting}
            />
          </div>

          {/* Category Selection */}
          <div>
            <label
              htmlFor="edit-product-category"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Category
            </label>
            <div className="space-y-2">
              <select
                id="edit-product-category"
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value || undefined,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.title}
                  </option>
                ))}
              </select>

              {/* Add New Category */}
              {!showNewCategoryInput ? (
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  className="flex items-center gap-2 text-sm text-zontaGold hover:text-zontaRed transition"
                  disabled={isSubmitting}
                >
                  <Plus size={16} />
                  <span>Create New Category</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-zontaGold focus:border-transparent"
                    disabled={createCategoryMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCategoryName.trim()) {
                        createCategoryMutation.mutate(newCategoryName.trim());
                      }
                    }}
                    className="px-3 py-2 text-sm bg-zontaGold text-white rounded-lg hover:bg-zontaRed transition disabled:opacity-50"
                    disabled={
                      createCategoryMutation.isPending ||
                      !newCategoryName.trim()
                    }
                  >
                    {createCategoryMutation.isPending ? "Adding..." : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName("");
                    }}
                    className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    disabled={createCategoryMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Image
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
                  onClick={() =>
                    document.getElementById("editProductImage")?.click()
                  }
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
                  id="editProductImage"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="editProductImage"
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
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="editProductImage"
              disabled={isSubmitting}
            />
          </div>

          {/* In Stock */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="editInStock"
              checked={formData.inStock}
              onChange={(e) =>
                setFormData({ ...formData, inStock: e.target.checked })
              }
              className="w-5 h-5 text-zontaGold border-gray-300 rounded focus:ring-2 focus:ring-zontaGold"
              disabled={isSubmitting}
            />
            <label
              htmlFor="editInStock"
              className="text-sm font-semibold text-gray-700"
            >
              Product is in stock
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
              {isSubmitting ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
