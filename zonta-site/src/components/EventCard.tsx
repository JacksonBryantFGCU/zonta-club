// src/components/EventCard.tsx
interface EventCardProps {
  event: {
    _id: string;
    title: string;
    date: string;
    location?: string;
    description?: string;
    imageUrl?: string;
  };
}

export default function EventCard({ event }: EventCardProps) {
  return (
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
        {event.description && (
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}