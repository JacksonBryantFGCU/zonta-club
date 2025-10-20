import { useEffect, useState } from "react";
import HeroImage from "../assets/hero_women_empowerment.jpg";
import { sanity } from "../lib/sanityClient";
import groq from "groq";
import EventCard from "../components/EventCard";

interface Event {
  _id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  imageUrl?: string;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent 3 events
  useEffect(() => {
    const query = groq`*[_type == "event"] | order(date desc)[0..2]{
      _id, title, date, location, description, "imageUrl": image.asset->url
    }`;

    sanity.fetch<Event[]>(query).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className="flex flex-col items-center justify-center text-center overflow-hidden -mt-4">
      {/* ===== Hero Section ===== */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center w-full text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HeroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-zontaGold/70 mix-blend-multiply"></div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-4xl text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 drop-shadow-lg">
            Empowering Women <br className="hidden sm:block" /> Through Service
            & Advocacy
          </h1>
          <p className="text-lg sm:text-xl text-zontaDark/90 bg-white/60 px-6 py-3 rounded-lg max-w-2xl mx-auto font-medium">
            The Zonta Club of Naples advances the status of women locally and
            globally — creating real change through compassion, education, and
            advocacy.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-zontaRed text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaDark transition-all duration-300">
              Learn More
            </button>
            <button className="bg-white text-zontaRed font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaGold hover:text-white transition-all duration-300">
              Donate
            </button>
          </div>
        </div>

        {/* Decorative Wave */}
        <svg
          className="absolute bottom-0 left-0 w-full text-white"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M0,224L60,202.7C120,181,240,139,360,154.7C480,171,600,245,720,250.7C840,256,960,192,1080,154.7C1200,117,1320,107,1380,101.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </section>

      {/* ===== Mission / Impact Section ===== */}
      <section className="py-20 px-6 bg-white text-zontaDark max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-zontaRed mb-8">
          Our Mission & Impact
        </h2>
        <p className="text-lg leading-relaxed max-w-3xl mx-auto mb-12">
          Zonta Club of Naples is part of a global organization of professionals
          empowering women through service and advocacy. We support education,
          health, and equality initiatives while connecting local members to a
          worldwide community of leaders and volunteers.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          <div className="p-6 border border-zontaGold rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold text-zontaRed mb-3">
              🧡 Community Service
            </h3>
            <p>
              Partnering with local organizations to address issues like
              domestic violence prevention, education, and women’s healthcare.
            </p>
          </div>
          <div className="p-6 border border-zontaGold rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold text-zontaRed mb-3">
              🎓 Scholarships
            </h3>
            <p>
              Supporting women pursuing higher education through local and
              international scholarships.
            </p>
          </div>
          <div className="p-6 border border-zontaGold rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold text-zontaRed mb-3">
              🌍 Global Connection
            </h3>
            <p>
              Zonta International unites clubs in over 60 countries, building a
              network of advocacy and empowerment worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Upcoming Events Section ===== */}
      <section className="py-20 px-6 bg-zontaGold/5 w-full">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-zontaRed mb-8">
            Upcoming Events
          </h2>

          {loading ? (
            <p className="text-zontaDark/70">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-zontaDark/70">No upcoming events at this time.</p>
          ) : (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== Join & Donate CTA ===== */}
      <section className="py-20 px-6 bg-zontaDark text-white text-center w-full">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">
            Join Our Mission to Empower Women
          </h2>
          <p className="text-lg mb-10">
            Whether through membership, donations, or volunteering — your
            contribution makes an impact. Together, we can change lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-zontaGold text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaRed transition-all duration-300">
              Become a Member
            </button>
            <button className="bg-white text-zontaDark font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaGold hover:text-white transition-all duration-300">
              Donate
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}