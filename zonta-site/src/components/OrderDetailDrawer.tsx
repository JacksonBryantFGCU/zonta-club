// zonta-site/src/components/OrderDetailDrawer.tsx

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Calendar, DollarSign, Package } from "lucide-react";
import type { Order } from "../queries/orderQueries";

interface Props {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailDrawer({ order, onClose }: Props) {
  return (
    <AnimatePresence>
      {order && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-zontaRed">
                Order Details
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-zontaRed"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="text-zontaRed w-4 h-4" />
                <span className="font-medium">Email:</span>
                <span>{order.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="text-zontaRed w-4 h-4" />
                <span className="font-medium">Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="text-zontaRed w-4 h-4" />
                <span className="font-medium">Date:</span>
                <span>
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Package className="text-zontaRed w-4 h-4" />
                <span className="font-medium">Status:</span>
                <span
                  className={`px-2 py-1 rounded-md text-white text-xs ${
                    order.status === "Pending"
                      ? "bg-yellow-600"
                      : order.status === "Completed"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Future: add ordered items here */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}