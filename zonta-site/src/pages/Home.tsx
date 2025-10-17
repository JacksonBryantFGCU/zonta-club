import HeroImage from "../assets/hero_women_empowerment.jpg"; // ← optional hero image

export default function Home() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center overflow-hidden -mt-4">
      {/* ===== Background Image with Overlay ===== */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${HeroImage})`,
        }}
      ></div>
      <div className="absolute inset-0 bg-zontaGold/70 mix-blend-multiply"></div>

      {/* ===== Hero Content ===== */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-4xl text-white">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 drop-shadow-lg">
          Empowering Women <br className="hidden sm:block" /> Through Service
          & Advocacy
        </h1>
        <p className="text-lg sm:text-xl text-zontaDark/90 bg-white/60 px-6 py-3 rounded-lg max-w-2xl mx-auto font-medium">
          The Zonta Club of Naples is committed to advancing the status of
          women locally and globally — creating real change through compassion,
          education, and advocacy.
        </p>

        {/* ===== Buttons ===== */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-zontaRed text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaDark transition-all duration-300">
            Learn More
          </button>
          <button className="bg-white text-zontaRed font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-zontaGold hover:text-white transition-all duration-300">
            Donate
          </button>
        </div>
      </div>

      {/* ===== Decorative Bottom Wave (optional aesthetic) ===== */}
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
  );
}