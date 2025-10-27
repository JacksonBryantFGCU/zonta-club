import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEvents, deleteEvent } from "../../queries/eventQueries";

interface Event {
  _id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
}

export default function EventsV2() {
  const queryClient = useQueryClient();

  // Fetch events
  const {
    data: events = [],
    isLoading,
    isError,
    error,
  } = useQuery<Event[]>({
    queryKey: ["admin-v2", "events"],
    queryFn: fetchEvents,
    staleTime: 60_000,
  });

  // Delete event mutation
  const mutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-v2", "events"] });
    },
  });

  if (isLoading)
    return <p className="text-center text-gray-500 py-8">Loading events...</p>;

  if (isError)
    return (
      <div className="text-center text-red-600 py-8">
        <p>Failed to load events.</p>
        <p className="text-sm text-gray-500 mt-2">
          {(error as Error)?.message ?? "Unknown error"}
        </p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-zontaRed">Events</h2>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-zontaGold text-white rounded-md shadow hover:bg-zontaRed transition"
            onClick={() => alert("TODO: Open Add Event Modal")}
          >
            Add Event
          </button>
          <button
            className="px-4 py-2 bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["admin-v2", "events"] })
            }
          >
            Refresh List
          </button>
        </div>
      </div>

      {/* ===== Event Table ===== */}
      {events.length === 0 ? (
        <p className="text-gray-600 text-sm">No events found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-zontaGold text-sm">
            <thead className="bg-zontaGold text-white">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event._id}
                  className="border-b border-zontaGold/40 hover:bg-zontaGold/10"
                >
                  <td className="px-4 py-2 font-medium">{event.title}</td>
                  <td className="px-4 py-2">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{event.location ?? "—"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="px-3 py-1 text-xs bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
                      onClick={() => alert(`Edit event ${event._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                      onClick={() =>
                        confirm("Delete this event?") && mutation.mutate(event._id)
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