// zonta-site/src/pages/Admin/Events.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../queries/eventQueries";
import AddEventModal, { type EventFormData } from "./Events/AddEventModal";
import EditEventModal, { type Event } from "./Events/EditEventModal";

export default function Events() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch events
  const {
    data: events = [],
    isLoading,
    isError,
    error,
  } = useQuery<Event[]>({
    queryKey: ["admin", "events"],
    queryFn: fetchEvents,
    staleTime: 60_000,
  });

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      setIsAddModalOpen(false);
    },
  });

  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: EventFormData }) =>
      updateEvent(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      setIsEditModalOpen(false);
      setSelectedEvent(null);
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    },
  });

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleDelete = (eventId: string, eventTitle: string) => {
    if (confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      deleteMutation.mutate(eventId);
    }
  };

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
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Event
          </button>
          <button
            className="px-4 py-2 bg-gray-100 text-zontaRed rounded-md hover:bg-gray-200 transition"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["admin", "events"],
              })
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
                <th className="px-4 py-2 text-left">Image</th>
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
                  <td className="px-4 py-2">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium">{event.title}</td>
                  <td className="px-4 py-2">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{event.location ?? "—"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="px-3 py-1 text-xs bg-zontaGold text-white rounded-md hover:bg-zontaRed transition"
                      onClick={() => handleEdit(event)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                      onClick={() => handleDelete(event._id, event.title)}
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

      {/* Modals */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(event) => createMutation.mutate(event)}
        isSubmitting={createMutation.isPending}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEvent(null);
        }}
        onSubmit={(id, updates) => updateMutation.mutate({ id, updates })}
        isSubmitting={updateMutation.isPending}
        event={selectedEvent}
      />
    </div>
  );
}
