import { motion } from "framer-motion";
import HeroImage from "../assets/hero_women_empowerment.jpg";

export default function Scholarships() {
  return (
    <main className="flex flex-col items-center text-center overflow-hidden -mt-4">
      {/* ===== Hero Section ===== */}
      <section className="relative w-full min-h-[60vh] flex flex-col justify-center items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HeroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-zontaGold/70 mix-blend-multiply"></div>

        <div className="relative z-10 max-w-3xl px-6 text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 drop-shadow-md">
            Scholarships & Awards
          </h1>
          <p className="text-lg sm:text-xl bg-white/70 text-zontaDark px-6 py-3 rounded-lg shadow-md font-medium">
            The Zonta Club of Naples supports women in science, technology,
            engineering, and mathematics through international awards and
            recognition.
          </p>
        </div>
      </section>

      {/* ===== Award Card ===== */}
      <section className="py-20 px-6 bg-white text-zontaDark w-full">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-zontaGold rounded-2xl shadow-md overflow-hidden text-left"
          >
            {/* Card header */}
            <div className="bg-zontaMahogany px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-white">
                Zonta Women in STEM Award
              </h2>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                Applications Closed
              </span>
            </div>

            <div className="p-8 space-y-7">
              {/* Description */}
              <p className="text-gray-700 leading-relaxed">
                The Zonta Women in STEM Award uplifts innovation and celebrates
                the accomplishments of women ages 18–35 in science, technology,
                engineering, and mathematics fields. The award recognizes
                groundbreaking research, pioneering discoveries, and exemplary
                contributions to advancing knowledge and innovation in STEM.
              </p>

              {/* Award detail */}
              <div>
                <h3 className="text-xs font-semibold text-zontaMahogany uppercase tracking-widest mb-2">
                  Award
                </h3>
                <p className="text-gray-700">
                  Zonta International offers{" "}
                  <strong>16 international awards of US$10,000 each</strong> and
                  a complimentary one-year supporting membership in Zonta
                  International for the next financial year.
                </p>
              </div>

              {/* Eligibility */}
              <div>
                <h3 className="text-xs font-semibold text-zontaMahogany uppercase tracking-widest mb-2">
                  Eligibility
                </h3>
                <p className="text-gray-700">
                  Women ages <strong>18–35</strong> at the time of application
                  who demonstrate groundbreaking research, pioneering
                  discoveries, or exemplary contributions in a science,
                  technology, engineering, or mathematics field of study or
                  industry.
                </p>
              </div>

              {/* Application Status */}
              <div className="bg-zontaGold/10 border border-zontaGold/30 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-zontaMahogany uppercase tracking-widest mb-2">
                  Application Status
                </h3>
                <p className="text-gray-700">
                  The deadline to apply for the 2026 Zonta Women in STEM Award
                  is now closed. Please check back in{" "}
                  <strong>September 2026</strong> for information about the next
                  application cycle.
                </p>
              </div>

              {/* Disabled CTA */}
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 font-semibold py-3 rounded-md cursor-not-allowed"
              >
                Applications Currently Closed
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Contact ===== */}
      <section className="pb-20 px-6 text-center">
        <p className="text-gray-600">
          For questions about our scholarship programs, contact us at{" "}
          <a
            href="mailto:info@zontanaples.org"
            className="text-zontaMahogany underline hover:text-zontaGold transition"
          >
            info@zontanaples.org
          </a>
        </p>
      </section>
    </main>
  );
}
