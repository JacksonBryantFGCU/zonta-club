// zonta-site/src/pages/MembershipCancel.tsx

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function MembershipCancel() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-zontaGold/10 to-white px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md bg-white p-8 rounded-xl shadow-md border border-zontaGold"
      >
        <h1 className="text-3xl font-bold text-zontaRed mb-4">
          Payment Cancelled
        </h1>
        <p className="text-gray-700 mb-6">
          Your membership application has been cancelled.  
          You can return to the membership page to try again.
        </p>
        <Link
          to="/membership"
          className="inline-block px-6 py-3 bg-zontaGold text-white rounded-lg font-semibold hover:bg-zontaRed transition"
        >
          Back to Memberships
        </Link>
      </motion.div>
    </section>
  );
}