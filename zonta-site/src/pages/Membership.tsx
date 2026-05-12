import { motion } from "framer-motion";
import HeroImage from "../assets/hero_women2.jpeg";

export default function Membership() {
  return (
    <main className="bg-white">
      {/* ================= HERO ================= */}
      <section className="grid md:grid-cols-2 items-center gap-10 px-6 py-20 max-w-7xl mx-auto">
        <div className="h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-zontaGold/40">
          <img
            src={HeroImage}
            className="w-full h-full object-cover"
            alt="Hero Image of women empowering each other"
          />
        </div>

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

      {/* ================= HOW TO APPLY ================= */}
      <section className="bg-zontaLightGold/10 py-20 mt-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-zontaMahogany mb-4">
            How to Apply
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Membership applications are submitted by mail. There is no online
            application.
          </p>

          {/* Steps */}
          <ol className="space-y-6 mb-12">
            {[
              "Download and print the New Member Application below.",
              "Complete the application in full.",
              `Write a check for $170.00 payable to "Zonta Club of Naples".`,
              "Mail your completed application and check to the address below.",
            ].map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-4 items-start"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-zontaMahogany text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-gray-700 pt-1">{step}</p>
              </motion.li>
            ))}
          </ol>

          {/* Download button */}
          <div className="text-center mb-12">
            <a
              href="/documents/new-member-application.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-zontaGold text-white font-semibold px-8 py-3 rounded-md hover:bg-zontaOrange transition"
            >
              ↓ Download New Member Application (PDF)
            </a>
          </div>

          {/* Mailing address */}
          <div className="bg-white rounded-2xl border border-zontaGold/40 shadow-sm p-8 mb-6 text-center">
            <h3 className="text-lg font-semibold text-zontaMahogany mb-3">
              Mailing Address
            </h3>
            <address className="not-italic text-gray-700 leading-relaxed">
              Zonta Club of Naples
              <br />
              P.O. Box 10911
              <br />
              Naples, FL 34101
            </address>
          </div>

          {/* Payment method note */}
          <div className="bg-zontaGold/10 border border-zontaGold/30 rounded-xl p-5 mb-6 text-sm text-gray-700">
            <p>
              <strong>Note:</strong> Membership dues must be submitted by check
              with your mailed application. Please make checks payable to{" "}
              <strong>"Zonta Club of Naples"</strong>.
            </p>
          </div>

          {/* Board review note */}
          <div className="bg-white rounded-2xl border border-zontaGold/40 shadow-sm p-6 text-sm text-gray-600">
            <p>
              Your application will be reviewed by the Club's Board of
              Directors. If your application is not approved, your check will be
              returned.
            </p>
          </div>
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
