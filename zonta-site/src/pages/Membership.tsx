import { motion } from "framer-motion";
import { Users, HeartHandshake, Calendar, Star } from "lucide-react";

export default function Membership() {
  const benefits = [
    {
      icon: <Users className="w-8 h-8 text-zontaRed" />,
      title: "Empower Women",
      description: "Be part of a global community dedicated to advancing women's rights and equality.",
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-zontaRed" />,
      title: "Community Service",
      description: "Contribute to meaningful local projects that uplift women and girls in your area.",
    },
    {
      icon: <Calendar className="w-8 h-8 text-zontaRed" />,
      title: "Networking & Events",
      description: "Attend monthly meetings, workshops, and events to connect with like-minded members.",
    },
    {
      icon: <Star className="w-8 h-8 text-zontaRed" />,
      title: "Leadership Opportunities",
      description: "Gain experience leading service initiatives and mentoring new members.",
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-zontaGold/10 to-white text-center px-6 py-16">
      {/* ===== Hero Section ===== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-zontaRed mb-4">
          Become a Member
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          Join the <span className="font-semibold text-zontaRed">Zonta Club of Naples</span> — 
          an organization of professionals empowering women through service and advocacy.
        </p>
      </motion.div>

      {/* ===== Benefits Grid ===== */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
          },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-16"
      >
        {benefits.map((benefit, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="bg-white border border-zontaGold rounded-xl shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              {benefit.icon}
              <h3 className="text-lg font-semibold text-zontaDark">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== Call to Action Card ===== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="max-w-xl mx-auto bg-white border border-zontaGold shadow-lg rounded-xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-zontaRed mb-3">Ready to Make an Impact?</h2>
        <p className="text-gray-700 mb-6">
          We welcome passionate individuals who share our mission of empowering women through service and advocacy.
        </p>
        <a
          href="mailto:zontaofnaples@gmail.com"
          className="inline-block bg-zontaGold text-white font-medium px-6 py-3 rounded-lg hover:bg-zontaDark transition"
        >
          Contact Us to Join
        </a>
      </motion.div>
    </section>
  );
}