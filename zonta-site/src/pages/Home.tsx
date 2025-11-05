import { useEffect, useState } from "react";
import HeroImage from "../assets/hero_women_empowerment.jpg";
import { sanity } from "../lib/sanityClient";
import groq from "groq";
import EventCard from "../components/EventCard";
import { useNavigate } from "react-router-dom";

interface Event {
  _id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  imageUrl?: string;
}

export default function Home() {
  const navigate = useNavigate();
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
    <main className="flex flex-col items-center justify-center text-center overflow-hidden -mt-4 font-body">
      {/* ===== Hero Section ===== */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center w-full text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HeroImage})` }}
        ></div>

        {/* Removed overlay — cleaner, more photographic look */}

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-4xl text-white drop-shadow-lg">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold leading-tight mb-6">
            Empowering Women <br className="hidden sm:block" /> Through Service
            & Advocacy
          </h1>
          <p className="text-lg sm:text-xl bg-white/75 text-zontaMahogany px-6 py-3 rounded-lg max-w-2xl mx-auto font-medium shadow-sm">
            The Zonta Club of Naples advances the status of women locally and
            globally — creating real change through compassion, education, and
            advocacy.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/about")}
              className="bg-zontaMahogany text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaOrange transition-all duration-300"
            >
              Learn More
            </button>
            <button
              onClick={() => navigate("/donate")}
              className="bg-white text-zontaMahogany font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaGold hover:text-white transition-all duration-300"
            >
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
            d="M0,224L60,202.7C120,181,240,139,360,154.7C480,171,600,245,720,250.7C840,256,960,192,1080,154.7C1200,117,1320,107,1380,101.3L1440,96L1440,320L0,320Z"
          ></path>
        </svg>
      </section>

      {/* ===== Mission / Impact Section ===== */}
      <section className="py-20 px-6 bg-white text-zontaMahogany max-w-7xl mx-auto">
        <h2 className="text-4xl font-heading font-bold mb-8 text-zontaMahogany">
          Our Mission & Impact
        </h2>
        <div className="mx-auto mb-8 w-24 h-1 bg-gradient-to-r from-transparent via-zontaGold to-transparent"></div>

        <p className="text-lg leading-relaxed max-w-3xl mx-auto mb-12">
          Zonta Club of Naples is part of a global organization of professionals
          empowering women through service and advocacy. We support education,
          health, and equality initiatives while connecting local members to a
          worldwide community of leaders and volunteers.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          {[
            {
              title: "Community Service",
              text: "Partnering with local organizations to address issues like domestic violence prevention, education, and women’s healthcare.",
            },
            {
              title: "Scholarships",
              text: "Supporting women pursuing higher education through local and international scholarships.",
            },
            {
              title: "Global Connection",
              text: "Zonta International unites clubs in over 60 countries, building a network of advocacy and empowerment worldwide.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 border border-zontaGold rounded-xl shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-2xl font-semibold text-zontaMahogany mb-3">
                {item.title}
              </h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Upcoming Events Section ===== */}
      <section className="py-20 px-6 bg-zontaGold/10 w-full">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-heading font-bold text-zontaMahogany mb-8">
            Upcoming Events
          </h2>
          <div className="mx-auto mb-8 w-24 h-1 bg-gradient-to-r from-transparent via-zontaOrange to-transparent"></div>

          {loading ? (
            <p className="text-zontaMahogany/70">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-zontaMahogany/70">
              No upcoming events at this time.
            </p>
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
      <section className="py-20 px-6 bg-zontaGold/20 text-zontaMahogany text-center w-full">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-heading font-bold mb-6">
            Join Our Mission to Empower Women
          </h2>
          <p className="text-lg mb-10">
            Whether through membership, donations, or volunteering — your
            contribution makes an impact. Together, we can change lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/membership")}
              className="bg-zontaGold text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaOrange transition-all duration-300"
            >
              Become a Member
            </button>
            <button
              onClick={() => navigate("/donate")}
              className="bg-white text-zontaMahogany font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaGold hover:text-white transition-all duration-300"
            >
              Donate
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}