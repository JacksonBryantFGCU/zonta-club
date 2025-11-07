// zonta-site/src/queries/eventQueries.ts

export interface Event {
  _id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  imageUrl?: string;
}

// ================================
// 🔐 Helper: Get Admin Token
// ================================
function getAuthHeaders() {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No admin token found. Please log in again.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ================================
// 📦 Fetch All Events
// ================================
export const fetchEvents = async (): Promise<Event[]> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/events`,
    { headers: getAuthHeaders() }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch events: ${msg}`);
  }

  return res.json();
};

// ================================
// ➕ Create Event
// ================================
export const createEvent = async (newEvent: Partial<Event>): Promise<Event> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/events`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(newEvent),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to create event: ${msg}`);
  }

  return res.json();
};

// ================================
// 🔄 Update Event
// ================================
export const updateEvent = async (
  id: string,
  updates: Partial<Event>
): Promise<Event> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/events/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to update event: ${msg}`);
  }

  return res.json();
};

// ================================
// 🗑️ Delete Event
// ================================
export const deleteEvent = async (id: string): Promise<void> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/admin/events/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to delete event: ${msg}`);
  }
};