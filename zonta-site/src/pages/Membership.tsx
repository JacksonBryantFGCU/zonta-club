import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fetchPublicMemberships } from "../queries/membershipPublicQueries";
import HeroImage from "../assets/hero_women2.jpeg";

export default function Membership() {
  const navigate = useNavigate();

  const {
    data: memberships = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-memberships"],
    queryFn: fetchPublicMemberships,
  });

  return (
    <main className="bg-white">
      <section className="grid md:grid-cols-2 items-center gap-10 px-6 py-20 max-w-7xl mx-auto">
        {/* Image block */}
        <div className="h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-zontaGold/40">
          <img
            src={HeroImage}
            className="w-full h-full object-cover"
            alt="Hero Image of women empowering each other"
          />
        </div>

        {/* Text block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-zontaMahogany mb-5">
            Become a Member
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            Join the{" "}
            <span className="font-semibold text-zontaMahogany">
              Zonta Club of Naples
            </span>{" "}
            and contribute to a global mission of service and empowerment.
          </p>
        </motion.div>
      </section>

      {/* ================= WHY JOIN ================= */}
      <section className="max-w-6xl mx-auto px-6 py-0">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-zontaMahogany mb-12">
          Why Join Zonta?
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Community Impact",
              text: "Support local service projects and empower women and girls in Naples and beyond.",
            },
            {
              title: "Leadership Growth",
              text: "Develop leadership skills and participate in meaningful advocacy opportunities.",
            },
            {
              title: "Networking & Connection",
              text: "Join a supportive community of inspiring women and build lifelong friendships.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-zontaGold/40 shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
            >
              <h3 className="text-xl font-semibold text-zontaMahogany mb-3">
                {item.title}
              </h3>
              <p className="text-gray-700">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= MEMBERSHIP TIERS ================= */}
      <section className="bg-zontaLightGold/10 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-zontaMahogany mb-14">
          Membership Options
        </h2>

        <div className="max-w-7xl mx-auto px-6">
          {isLoading ? (
            <p className="text-center text-gray-600 py-10">
              Loading memberships...
            </p>
          ) : isError ? (
            <p className="text-center text-red-600">
              Failed to load memberships.
            </p>
          ) : memberships.length === 0 ? (
            <p className="text-center text-gray-600">
              No membership options available right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {memberships.map((m, idx) => (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-8 border border-zontaGold/40 shadow-[0_8px_25px_rgba(0,0,0,0.05)] flex flex-col"
                >
                  <h3 className="text-2xl font-bold text-zontaMahogany mb-2">
                    {m.title}
                  </h3>

                  <p className="text-gray-700 text-sm mb-4">{m.description}</p>

                  <p className="text-lg font-semibold text-zontaGold mb-4">
                    {m.price ? `$${m.price.toFixed(2)}` : "No Fee"}
                  </p>

                  <ul className="text-gray-700 text-sm mb-6 space-y-2">
                    {m.benefits?.map((b: string, i: number) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-zontaGold text-lg leading-none">
                          •
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate(`/membership/apply/${m._id}`)}
                    className="mt-auto w-full bg-zontaGold text-white font-semibold py-2.5 rounded-md hover:bg-zontaOrange transition"
                  >
                    Join Now
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= QUESTIONS ================= */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center bg-white rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.05)] p-12 border border-zontaGold/30">
          <h2 className="text-3xl font-bold text-zontaMahogany mb-4">
            Have Questions?
          </h2>

          <p className="text-gray-700 mb-4">
            Reach out to our Membership Committee — we're here to help.
          </p>

          <a
            href="mailto:zonta_naples@gmail.com"
            className="text-zontaMahogany underline font-medium hover:text-zontaGold transition"
          >
            info@zontanaples.org
          </a>
        </div>
      </section>
    </main>
  );
}
