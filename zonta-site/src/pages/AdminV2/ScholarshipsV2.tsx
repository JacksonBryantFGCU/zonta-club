// src/pages/AdminV2/ScholarshipsV2.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchScholarships,
  deleteScholarship,
} from "../../queries/scholarshipQueries";

export default function ScholarshipsV2() {
  const queryClient = useQueryClient();

  const { data: scholarships = [], isLoading, isError } = useQuery({
    queryKey: ["admin-v2", "scholarships"],
    queryFn: fetchScholarships,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: deleteScholarship,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-v2", "scholarships"] }),
  });

  if (isLoading)
    return <p className="text-center text-gray-500 py-8">Loading scholarships...</p>;
  if (isError)
    return <p className="text-center text-red-600 py-8">Failed to load scholarships.</p>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-zontaRed">Scholarships</h2>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-zontaGold text-white rounded-md shadow hover:bg-zontaRed transition"
            onClick={() => alert("TODO: Open Add Scholarship Modal")}
          >
            Add Scholarship
          </button>
          <button
            className="px-4 py-2 bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["admin-v2", "scholarships"] })
            }
          >
            Refresh
          </button>
        </div>
      </div>

      {scholarships.length === 0 ? (
        <p className="text-gray-600 text-sm">No scholarships found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-zontaGold text-sm">
            <thead className="bg-zontaGold text-white">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Deadline</th>
                <th className="px-4 py-2 text-left">Eligibility</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scholarships.map((s) => (
                <tr
                  key={s._id}
                  className="border-b border-zontaGold/40 hover:bg-zontaGold/10"
                >
                  <td className="px-4 py-2 font-medium">{s.title}</td>
                  <td className="px-4 py-2">
                    {s.deadline ? new Date(s.deadline).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {Array.isArray(s.eligibility)
                      ? s.eligibility.join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="px-3 py-1 text-xs bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
                      onClick={() => alert(`Edit scholarship ${s._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                      onClick={() =>
                        confirm("Delete this scholarship?") && mutation.mutate(s._id)
                      }
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