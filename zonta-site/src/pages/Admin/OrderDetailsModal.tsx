import { X } from "lucide-react";
import type { FC } from "react";

interface Order {
  _id: string;
  email: string;
  total: number;
  status: "Pending" | "Completed" | "Cancelled" | "Paid";
  createdAt: string;
}

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-5 py-3">
          <h3 className="text-lg font-semibold text-zontaRed">
            Order Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-zontaRed"
            aria-label="Close Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 text-sm text-gray-700 space-y-3">
          <p>
            <span className="font-medium text-gray-900">Order ID:</span>{" "}
            {order._id}
          </p>
          <p>
            <span className="font-medium text-gray-900">Customer Email:</span>{" "}
            {order.email}
          </p>
          <p>
            <span className="font-medium text-gray-900">Status:</span>{" "}
            {order.status}
          </p>
          <p>
            <span className="font-medium text-gray-900">Total:</span> $
            {order.total.toFixed(2)}
          </p>
          <p>
            <span className="font-medium text-gray-900">Created:</span>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 px-5 py-3">
          <button
            onClick={onClose}
            className="bg-zontaGold text-white px-4 py-2 rounded-md hover:bg-zontaRed transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;