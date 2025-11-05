// src/pages/Success.tsx
import { useEffect, useContext, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Home, ShoppingBag, Users, BookOpen, CalendarDays } from "lucide-react";
import { CartContext } from "../context/CartContext";

export default function Success() {
  const { clearCart } = useContext(CartContext)!;
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const type = params.get("type") ?? "checkout";

  // 🧠 Centralized config by success type
  const content = useMemo(() => {
    switch (type) {
      case "membership":
        return {
          title: "Membership Application Submitted!",
          message:
            "Thank you for applying to become a member of the Zonta Club of Naples. Your application has been received and is currently under review. You’ll receive a confirmation email once approved.",
          icon: Users,
          accentColor: "text-zontaRed",
          actionLabel: "View Upcoming Events",
          actionPath: "/events",
        };
      case "scholarship":
        return {
          title: "Scholarship Application Submitted!",
          message:
            "Thank you for applying for one of our scholarships. Our scholarship committee will review your application and notify selected recipients via email.",
          icon: BookOpen,
          accentColor: "text-zontaGold",
          actionLabel: "Learn About Our Mission",
          actionPath: "/about",
        };
      default:
        return {
          title: "Thank you for your purchase!",
          message:
            "Your payment was processed successfully. You’ll receive an email confirmation with your order details shortly.",
          icon: ShoppingBag,
          accentColor: "text-green-500",
          actionLabel: "Continue Shopping",
          actionPath: "/ecommerce",
        };
    }
  }, [type]);

  // 🧹 Clear cart and scroll to top if it's a checkout
  useEffect(() => {
    if (type === "checkout") clearCart?.();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [type, clearCart]);

  const handleNavigate = (path: string) => {
    navigate(path, { replace: true });
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 150);
  };

  const Icon = content.icon;

  return (
    <motion.section
      className="flex flex-col items-center justify-center min-h-[85vh] text-center px-6 bg-gradient-to-b from-gray-50 to-white"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* ✅ Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="mb-6"
      >
        <CheckCircle className={`${content.accentColor} w-20 h-20 mx-auto`} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-bold text-gray-800 mb-3"
      >
        {content.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-gray-600 max-w-md mb-8"
      >
        {content.message}
      </motion.p>

      {/* 🧾 Card (visual accent) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white shadow-lg rounded-xl p-6 max-w-md w-full mb-10 border border-gray-100"
      >
        <div className="flex flex-col items-center text-gray-700 space-y-3">
          <Icon className={`${content.accentColor} w-10 h-10`} />
          <p className="text-base font-medium">
            {type === "membership"
              ? "We’ll be in touch soon once your application is reviewed."
              : type === "scholarship"
              ? "Our scholarship committee will reach out via email."
              : "We’re preparing your order for fulfillment."}
          </p>
          <p className="text-sm text-gray-500">
            {type === "checkout"
              ? "You’ll be notified once it’s on the way!"
              : "Please check your email for updates."}
          </p>
        </div>
      </motion.div>

      {/* 🔗 Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <button
          onClick={() => handleNavigate(content.actionPath)}
          className="flex items-center gap-2 px-6 py-2 bg-zontaGold text-white font-medium rounded-lg shadow hover:bg-zontaRed transition"
        >
          {type === "checkout" ? (
            <>
              <ShoppingBag size={18} /> {content.actionLabel}
            </>
          ) : type === "membership" ? (
            <>
              <CalendarDays size={18} /> {content.actionLabel}
            </>
          ) : (
            <>
              <BookOpen size={18} /> {content.actionLabel}
            </>
          )}
        </button>

        <button
          onClick={() => handleNavigate("/")}
          className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          <Home size={18} />
          Back to Home
        </button>
      </motion.div>

      {/* 💛 Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-12 text-sm text-gray-500"
      >
        Thank you for supporting the{" "}
        <span className="text-zontaRed font-semibold">Zonta Club of Naples</span> 💛
      </motion.footer>
    </motion.section>
  );
}