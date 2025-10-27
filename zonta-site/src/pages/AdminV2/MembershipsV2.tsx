import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMemberships,
  deleteMembership,
} from "../../queries/membershipQueries";

export default function MembershipsV2() {
  const queryClient = useQueryClient();

  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ["admin-v2", "memberships"],
    queryFn: fetchMemberships,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: deleteMembership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-v2", "memberships"] });
    },
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-zontaRed">Memberships</h2>
        <div className="flex gap-3">
          <button
            onClick={() => alert("TODO: Add Membership")}
            className="px-4 py-2 bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
          >
            Add Membership
          </button>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-v2", "memberships"] })}
            className="px-4 py-2 bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500 py-8">Loading memberships...</p>
      ) : memberships.length === 0 ? (
        <p className="text-gray-600 text-sm">No memberships found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-zontaGold text-sm">
            <thead className="bg-zontaGold text-white">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Duration</th>
                <th className="px-4 py-2 text-left">Active</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((m) => (
                <tr
                  key={m._id}
                  className="border-b border-zontaGold/40 hover:bg-zontaGold/10"
                >
                  <td className="px-4 py-2 font-medium">{m.title}</td>
                  <td className="px-4 py-2">${m.price?.toFixed(2)}</td>
                  <td className="px-4 py-2">{m.duration} mo</td>
                  <td className="px-4 py-2">
                    {m.isActive ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-red-600 font-medium">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => alert(`Edit ${m.title}`)}
                      className="px-3 py-1 text-xs bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        confirm("Delete this membership?") && mutation.mutate(m._id)
                      }
                      className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}