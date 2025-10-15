import { useEffect, useState } from "react";
import { sanity } from "../lib/sanityClient";
import groq from "groq";

// ✅ Define a TypeScript interface for the event data
interface Event {
  _id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  imageUrl?: string;
}

// GROQ query to get events from Sanity
const query = groq`*[_type == "event"] | order(date desc) {
  _id,
  title,
  date,
  location,
  description,
  "imageUrl": image.asset->url
}`;

export default function Events() {
  // ✅ Use a typed array for state
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sanity.fetch<Event[]>(query).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-20">Loading events...</div>;
  }

  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-zontaDark mb-8">Upcoming Events</h1>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-zontaGold/10 border border-zontaGold rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
            >
              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5 text-left">
                <h2 className="text-2xl font-bold text-zontaRed mb-2">
                  {event.title}
                </h2>
                <p className="text-sm text-zontaDark/80 mb-1">
                  📅 {new Date(event.date).toLocaleDateString()}
                </p>
                {event.location && (
                  <p className="text-sm text-zontaDark/70 mb-3">
                    📍 {event.location}
                  </p>
                )}
                <p className="text-gray-700">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}