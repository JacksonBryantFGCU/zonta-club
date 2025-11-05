interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: "pending" | "approved" | "rejected") => void;
  isSubmitting: boolean;
  currentStatus: "pending" | "approved" | "rejected";
}

export default function UpdateStatusModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  currentStatus,
}: UpdateStatusModalProps) {
  if (!isOpen) return null;

  const statuses: ("pending" | "approved" | "rejected")[] = [
    "pending",
    "approved",
    "rejected",
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm">
        <h2 className="text-lg font-bold text-zontaRed mb-4">
          Update Application Status
        </h2>
        <div className="space-y-3">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => onSubmit(s)}
              disabled={isSubmitting}
              className={`w-full px-4 py-2 rounded-md border ${
                s === currentStatus
                  ? "bg-zontaGold text-white border-transparent"
                  : "border-gray-300 hover:bg-zontaGold/10"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}