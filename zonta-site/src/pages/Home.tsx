// zonta-site/src/pages/Home.tsx

import { useEffect, useState } from "react";
import GroupBanner from "../assets/carousel/group-banner.jpg";
import MallBooth from "../assets/carousel/mall-booth.jpeg";
import VolunteersFlyer from "../assets/carousel/volunteers-flyer.jpg";
import GroupWithOfficer from "../assets/carousel/group-with-officer.jpeg";
import AwardPresentation from "../assets/carousel/award-presentation.jpg";
import DonationCheck from "../assets/carousel/donation-check.jpg";
import Conference from "../assets/carousel/conference.jpeg";
import HabitatRestore from "../assets/carousel/habitat-restore.jpg";
import PhotoCollage from "../assets/carousel/photo-collage.png";

import { sanity } from "../lib/sanityClient";
import groq from "groq";
import EventCard from "../components/EventCard";
import PartnerCard from "../components/PartnerCard";
import { useNavigate } from "react-router-dom";

// Partner logos
import ACSLogo from "../assets/sponsors/acs.png";
import HabitatLogo from "../assets/sponsors/habitat-for-humanity.png";
import PACELogo from "../assets/sponsors/pace.png";
import Path2FreedomLogo from "../assets/sponsors/path2freedom.jpg";
import ProjectHelpLogo from "../assets/sponsors/project-help.png";
import ShelterLogo from "../assets/sponsors/shelter.jpg";

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
  // Each slide is configured independently so its zoom/cropping can be
  // tuned later without affecting the other images.
  //   fit:      "cover"   = fills the frame (may crop edges) — best for wide photos
  //             "contain" = shows the whole image (no cropping, letterboxed)
  //   position: which part stays in view when "cover" crops (e.g. "center top")
  type HeroSlide = {
    src: string;
    fit: "cover" | "contain";
    position?: string;
  };
  const heroImages: HeroSlide[] = [
    { src: GroupBanner, fit: "cover", position: "center" }, // lead image
    { src: MallBooth, fit: "contain", position: "center" },
    { src: VolunteersFlyer, fit: "contain", position: "center" },
    { src: GroupWithOfficer, fit: "contain", position: "center" },
    { src: AwardPresentation, fit: "contain", position: "center" }, // portrait
    { src: DonationCheck, fit: "contain", position: "center" },
    { src: Conference, fit: "contain", position: "center" },
    { src: HabitatRestore, fit: "contain", position: "center" }, // portrait
    { src: PhotoCollage, fit: "contain", position: "center" },
  ];
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

    sanity.fetch<Event[]>(query)
      .then((data) => {
        setEvents(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
        {heroImages.map((slide, i) => (
          <div
            key={i}
            aria-hidden={currentIndex !== i}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ${
              currentIndex === i ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Blurred fill so "contain" images don't show empty bars */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl scale-110"
              style={{ backgroundImage: `url(${slide.src})` }}
            />
            {/* The image itself — whole (contain) or filling (cover) */}
            <div
              className="absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${slide.src})`,
                backgroundSize: slide.fit,
                backgroundPosition: slide.position ?? "center",
              }}
            />
          </div>
        ))}

        {/* Dark scrim — keeps the white heading readable over every image,
            including light backgrounds like the flyer and the check */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-black/40" />

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

      {/* ===== Mission Section ===== */}
      <section className="py-20 px-6 bg-white text-gray-800 max-w-7xl mx-auto -mt-1">
        <h2 className="text-4xl font-heading font-bold mb-4 text-zontaMahogany">
          Our Mission
        </h2>
        <div className="mx-auto mb-8 w-24 h-1 bg-gradient-to-r from-zontaCyan via-zontaBlue to-zontaCyan"></div>

        <p className="text-lg leading-relaxed max-w-3xl mx-auto mb-12 text-gray-700">
          The mission of the Zonta Club of Naples is to empower women and girls
          through service and advocacy. We work to improve the legal,
          educational, economic, health, and professional status of women while
          promoting equality, dignity, and opportunity for all.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          <div className="p-6 border-2 border-zontaPink/40 rounded-xl shadow-sm hover:shadow-xl hover:border-zontaPink hover:-translate-y-1 transition-all duration-300 bg-white">
            <h3 className="text-2xl font-semibold text-zontaPink mb-3">
              End Violence
            </h3>
            <p className="text-gray-700">
              Working to end violence against women and girls while supporting
              survivors of abuse, trafficking, and exploitation in our community.
            </p>
          </div>

          <div className="p-6 border-2 border-zontaViolet/40 rounded-xl shadow-sm hover:shadow-xl hover:border-zontaViolet hover:-translate-y-1 transition-all duration-300 bg-white">
            <h3 className="text-2xl font-semibold text-zontaViolet mb-3">
              Education & Leadership
            </h3>
            <p className="text-gray-700">
              Promoting access to education and leadership opportunities,
              encouraging young women to become the confident leaders of
              tomorrow.
            </p>
          </div>

          <div className="p-6 border-2 border-zontaBlue/40 rounded-xl shadow-sm hover:shadow-xl hover:border-zontaBlue hover:-translate-y-1 transition-all duration-300 bg-white">
            <h3 className="text-2xl font-semibold text-zontaBlue mb-3">
              Advocacy & Equality
            </h3>
            <p className="text-gray-700">
              Advocating for gender equality and human rights while building
              community awareness around issues affecting women and families
              locally and globally.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Vision Section ===== */}
      <section className="py-20 px-6 bg-gradient-to-br from-zontaBlue/10 via-zontaCyan/5 to-zontaBlue/10 w-full">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-heading font-bold text-zontaMahogany mb-4">
            Our Vision
          </h2>
          <div className="mx-auto mb-8 w-24 h-1 bg-gradient-to-r from-zontaPink via-zontaViolet to-zontaPink"></div>

          <p className="text-lg leading-relaxed text-gray-700 mb-10">
            The vision of the Zonta Club of Naples is a world in which women's
            rights are recognized as human rights and every woman is empowered
            to achieve her full potential.
          </p>

          <ul className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              "Women and girls have equal access to education, healthcare, employment, and leadership opportunities.",
              "Communities are free from domestic violence, human trafficking, child marriage, and gender-based discrimination.",
              "Women are represented equally in decision-making roles across business, government, and society.",
              "Every woman and girl can live safely, confidently, and without fear.",
            ].map((item) => (
              <li
                key={item}
                className="flex gap-3 items-start bg-white rounded-xl p-5 shadow-sm border border-zontaCyan/20"
              >
                <span className="mt-1 shrink-0 w-3 h-3 rounded-full bg-zontaCyan"></span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== Core Values Section ===== */}
      <section className="py-20 px-6 bg-white w-full">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-heading font-bold text-zontaMahogany mb-4">
            Core Values
          </h2>
          <div className="mx-auto mb-12 w-24 h-1 bg-gradient-to-r from-zontaCyan via-zontaBlue to-zontaCyan"></div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {[
              {
                title: "Service",
                color: "zontaPink",
                desc: "Improving lives through meaningful action and volunteerism.",
              },
              {
                title: "Advocacy",
                color: "zontaViolet",
                desc: "Speaking out against injustice and promoting women's rights.",
              },
              {
                title: "Integrity",
                color: "zontaBlue",
                desc: "Upholding ethical leadership and accountability.",
              },
              {
                title: "Empowerment",
                color: "zontaCyan",
                desc: "Supporting women and girls in reaching their highest potential.",
              },
              {
                title: "Collaboration",
                color: "zontaMahogany",
                desc: "Partnering with schools, nonprofits, businesses, and community leaders to maximize impact.",
              },
              {
                title: "Education",
                color: "zontaViolet",
                desc: "Creating opportunities for lifelong learning and leadership development.",
              },
            ].map(({ title, color, desc }) => (
              <div
                key={title}
                className={`p-6 border-2 border-${color}/40 rounded-xl shadow-sm hover:shadow-xl hover:border-${color} hover:-translate-y-1 transition-all duration-300 bg-white`}
              >
                <h3 className={`text-xl font-semibold text-${color} mb-2`}>
                  {title}
                </h3>
                <p className="text-gray-700">{desc}</p>
              </div>
            ))}
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
              donateUrl="https://www.cancer.org/"
            />
            <PartnerCard
              name="Habitat for Humanity"
              logoUrl={HabitatLogo}
              donateUrl="https://www.habitat.org/"
            />
            <PartnerCard
              name="PACE Center for Girls"
              logoUrl={PACELogo}
              donateUrl="https://pacecenter.org/"
            />
            <PartnerCard
              name="Path2Freedom"
              logoUrl={Path2FreedomLogo}
              donateUrl="https://www.path2freedom.org"
            />
            <PartnerCard
              name="Project H.E.L.P."
              logoUrl={ProjectHelpLogo}
              donateUrl="https://projecthelpnaples.org/"
            />
            <PartnerCard
              name="The Shelter for Abused Women & Children"
              logoUrl={ShelterLogo}
              donateUrl="https://naplesshelter.org/"
            />
          </div>
        </div>
      </section>

      {/* ===== Community Impact & CTA ===== */}
      <section className="py-20 px-6 bg-gradient-to-br from-zontaLightGold/20 via-zontaGold/10 to-zontaOrange/15 text-zontaMahogany text-center w-full">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-heading font-bold mb-6">
            Community Impact
          </h2>
          <div className="mx-auto mb-8 w-24 h-1 bg-gradient-to-r from-zontaViolet via-zontaPink to-zontaViolet"></div>
          <p className="text-lg mb-6 text-gray-700 max-w-3xl mx-auto">
            The Zonta Club of Naples has demonstrated its commitment to its
            mission through leadership training for young women, scholarship
            opportunities, support for the Pace Center for Girls, advocacy art
            installations, and the establishment of Z Clubs in local schools.
            These programs help foster confidence, leadership, volunteerism, and
            academic achievement among young women in the Naples community.
          </p>
          <p className="text-lg mb-10 text-gray-700 max-w-3xl mx-auto">
            The Zonta Club of Naples exists to create positive and lasting
            change for women and girls through advocacy, education, and service.
            Inspired by the global mission of Zonta International, the club
            continues to champion equality, opportunity, and safety for women
            both locally and around the world. Through compassion, leadership,
            and action, the organization remains committed to building a
            brighter and more equitable future for all.
          </p>

          <h3 className="text-2xl font-heading font-semibold mb-4">
            Join Our Mission to Empower Women
          </h3>
          <p className="text-base mb-8 text-gray-600">
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

            <a
              href="https://zontastore.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-zontaMahogany font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaCyan hover:text-white hover:scale-105 border-2 border-zontaCyan transition-all duration-300"
            >
              Visit Our Store
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
