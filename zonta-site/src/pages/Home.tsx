// zonta-site/src/pages/Home.tsx

import { useEffect, useState } from "react";
import HeroImage1 from "../assets/hero_women_empowerment.jpg";
import HeroImage2 from "../assets/hero_women2.jpeg";
import HeroImage3 from "../assets/hero_women3.jpg";

import { sanity } from "../lib/sanityClient";
import groq from "groq";
import EventCard from "../components/EventCard";
import PartnerCard from "../components/PartnerCard";
import { useNavigate } from "react-router-dom";

// Partner logos
import ACSLogo from "../assets/acs-sponsor.png";
import HabitatLogo from "../assets/habitatforhumanity-sponsor.png";
import PACELogo from "../assets/pace-sponsor.png";
import Path2FreedomLogo from "../assets/path2freedom-sponsor.jpg";
import ProjectHelpLogo from "../assets/project-help-sponsor.png";
import ShelterLogo from "../assets/shelter-sponsor.jpg";

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

  // ===== HERO CAROUSEL SETUP =====
  const heroImages = [HeroImage1, HeroImage2, HeroImage3];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i === heroImages.length - 1 ? 0 : i + 1));
    }, 6000); // rotate every 6s

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // ===== FETCH EVENTS =====
  useEffect(() => {
    const query = groq`*[_type == "event"] | order(date desc)[0..2]{
      _id, title, date, location, description, "imageUrl": image.asset->url
    }`;

    sanity.fetch<Event[]>(query).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((i) => (i === 0 ? heroImages.length - 1 : i - 1));
  };

  const handleNext = () => {
    setCurrentIndex((i) => (i === heroImages.length - 1 ? 0 : i + 1));
  };

  return (
    <main className="flex flex-col items-center justify-center text-center overflow-hidden -mt-4 font-body">
      {/* ===== HERO CAROUSEL SECTION ===== */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center w-full text-center overflow-hidden">
        {/* Background Carousel */}
        {heroImages.map((img, i) => (
          <div
            key={i}
            className={`
              absolute inset-0 
              bg-cover
              bg-center
              sm:bg-center
              bg-no-repeat
              transition-opacity duration-[1500ms]
              ${currentIndex === i ? "opacity-100" : "opacity-0"}
            `}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 z-20 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
          aria-label="Previous image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-4 z-20 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
          aria-label="Next image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-24 z-20 flex gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === i
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-4xl text-white drop-shadow-lg">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold leading-tight mb-6">
            Empowering Women <br className="hidden sm:block" /> Through Service
            & Advocacy
          </h1>

          <p className="text-lg sm:text-xl bg-white/90 text-zontaMahogany px-6 py-3 rounded-lg max-w-2xl mx-auto font-medium shadow-sm border-2 border-zontaCyan/30">
            The Zonta Club of Naples advances the status of women locally and
            globally — creating real change through compassion, education, and
            advocacy.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/about")}
              className="bg-zontaMahogany text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaCyan hover:scale-105 transition-all duration-300"
            >
              Learn More
            </button>
            <button
              onClick={() => navigate("/donate")}
              className="bg-white text-zontaMahogany font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaLightGold hover:text-white hover:scale-105 border-2 border-zontaLightGold transition-all duration-300"
            >
              Donate
            </button>
          </div>
        </div>

        {/* Decorative Wave */}
        <svg
          className="absolute bottom-0 left-0 w-full text-white -mb-1"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,224L60,202.7C120,181,240,139,360,154.7C480,171,600,245,720,250.7C840,256,960,192,1080,154.7C1200,117,1320,107,1380,101.3L1440,96L1440,320L0,320Z"
          ></path>
        </svg>
      </section>

      {/* ===== Mission / Impact Section ===== */}
      <section className="py-20 px-6 bg-white text-gray-800 max-w-7xl mx-auto -mt-1">
        <h2 className="text-4xl font-heading font-bold mb-4 text-zontaMahogany">
          Our Mission & Impact
        </h2>
        <div className="mx-auto mb-8 w-24 h-1 bg-gradient-to-r from-zontaCyan via-zontaBlue to-zontaCyan"></div>

        <p className="text-lg leading-relaxed max-w-3xl mx-auto mb-12 text-gray-700">
          Zonta Club of Naples is part of a global organization of professionals
          empowering women through service and advocacy. We support education,
          health, and equality initiatives while connecting local members to a
          worldwide community of leaders and volunteers.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          {/* Community Service Card */}
          <div className="p-6 border-2 border-zontaPink/40 rounded-xl shadow-sm hover:shadow-xl hover:border-zontaPink hover:-translate-y-1 transition-all duration-300 bg-white">
            <h3 className="text-2xl font-semibold text-zontaPink mb-3">
              Community Service
            </h3>
            <p className="text-gray-700">
              Partnering with local organizations to address issues like
              domestic violence prevention, education, and women's healthcare.
            </p>
          </div>

          {/* Scholarships Card */}
          <div className="p-6 border-2 border-zontaViolet/40 rounded-xl shadow-sm hover:shadow-xl hover:border-zontaViolet hover:-translate-y-1 transition-all duration-300 bg-white">
            <h3 className="text-2xl font-semibold text-zontaViolet mb-3">
              Scholarships
            </h3>
            <p className="text-gray-700">
              Supporting women pursuing higher education through local and
              international scholarships.
            </p>
          </div>

          {/* Global Connection Card */}
          <div className="p-6 border-2 border-zontaBlue/40 rounded-xl shadow-sm hover:shadow-xl hover:border-zontaBlue hover:-translate-y-1 transition-all duration-300 bg-white">
            <h3 className="text-2xl font-semibold text-zontaBlue mb-3">
              Global Connection
            </h3>
            <p className="text-gray-700">
              Zonta International unites clubs in over 60 countries, building a
              network of advocacy and empowerment worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Upcoming Events ===== */}
      <section className="py-20 px-6 bg-gradient-to-br from-zontaBlue/10 via-zontaCyan/5 to-zontaBlue/10 w-full">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-heading font-bold text-zontaMahogany mb-4">
            Upcoming Events
          </h2>
          <div className="mx-auto mb-8 w-24 h-1 bg-gradient-to-r from-zontaPink via-zontaViolet to-zontaPink"></div>

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

      {/* ===== Who We Support ===== */}
      <section className="py-20 px-6 bg-white w-full">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-heading font-bold text-zontaMahogany mb-4">
            Who We Support
          </h2>
          <div className="mx-auto mb-8 w-24 h-1 bg-gradient-to-r from-zontaViolet via-zontaPink to-zontaViolet"></div>

          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-12">
            We proudly partner with organizations that share our commitment to
            empowering women, supporting families, and strengthening
            communities.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <PartnerCard
              name="American Cancer Society"
              logoUrl={ACSLogo}
              donateUrl="https://donate.cancer.org/"
            />
            <PartnerCard
              name="Habitat for Humanity"
              logoUrl={HabitatLogo}
              donateUrl="https://www.habitat.org/donate"
            />
            <PartnerCard
              name="PACE Center for Girls"
              logoUrl={PACELogo}
              donateUrl="https://pacecenter.org/donate/"
            />
            <PartnerCard
              name="Path2Freedom"
              logoUrl={Path2FreedomLogo}
              donateUrl="https://www.path2freedom.com/donate"
            />
            <PartnerCard
              name="Project H.E.L.P."
              logoUrl={ProjectHelpLogo}
              donateUrl="https://projecthelpnaples.org/donate/"
            />
            <PartnerCard
              name="The Shelter for Abused Women & Children"
              logoUrl={ShelterLogo}
              donateUrl="https://naplesshelter.org/donate/"
            />
          </div>
        </div>
      </section>

      {/* ===== Join & Donate CTA ===== */}
      <section className="py-20 px-6 bg-gradient-to-br from-zontaLightGold/20 via-zontaGold/10 to-zontaOrange/15 text-zontaMahogany text-center w-full">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-heading font-bold mb-6">
            Join Our Mission to Empower Women
          </h2>
          <p className="text-lg mb-10 text-gray-700">
            Whether through membership, donations, or volunteering — your
            contribution makes a real impact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/membership")}
              className="bg-zontaViolet text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaPink hover:scale-105 transition-all duration-300"
            >
              Become a Member
            </button>

            <button
              onClick={() => navigate("/donate")}
              className="bg-white text-zontaMahogany font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaCyan hover:text-white hover:scale-105 border-2 border-zontaCyan transition-all duration-300"
            >
              Donate
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
