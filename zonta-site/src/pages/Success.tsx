// zonta-site/src/pages/Success.tsx

import { useEffect, useContext, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag, Users, BookOpen, Home } from "lucide-react";
import { CartContext } from "../context/CartContext";

export default function Success() {
  const { clearCart } = useContext(CartContext)!;
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const type = params.get("type") ?? "checkout";

  console.log("Success page loaded. Type:", type);

  // Define the message + visuals by type
  const content = useMemo(() => {
    switch (type) {
      case "membership":
        return {
          title: "Membership Application Submitted!",
          message:
            "Thank you for applying to become a member of the Zonta Club of Naples. Your application has been received and is under review. You'll receive a confirmation email once approved.",
          icon: Users,
          accentColor: "text-zontaRed",
          button: { label: "Learn About Our Mission", path: "/about" },
        };
      case "scholarship":
        return {
          title: "Scholarship Application Submitted!",
          message:
            "Thank you for applying for one of our scholarships. Our scholarship committee will review your application and notify selected recipients via email.",
          icon: BookOpen,
          accentColor: "text-zontaGold",
          button: { label: "Learn About Our Mission", path: "/about" },
        };
      default:
        return {
          title: "Thank you for your purchase!",
          message:
            "Your payment was processed successfully. You’ll receive an email confirmation with your order details shortly.",
          icon: ShoppingBag,
          accentColor: "text-green-500",
          button: { label: "Continue Shopping", path: "/ecommerce" },
        };
    }
  }, [type]);

  // Clear cart for checkout + scroll top
  useEffect(() => {
    console.log("useEffect triggered. Type:", type);
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    if (type === "checkout") {
      console.log("Clearing cart...");
      clearCart?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const Icon = content.icon;

  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path);
    navigate(path);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Animated Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="mb-6"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </motion.div>

        {/* Title + Message */}
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
          className="text-gray-600 max-w-lg mb-8"
        >
          {content.message}
        </motion.p>

        {/* Accent Card */}
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
                ? "We’ll be in touch once your application is reviewed."
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

        {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => handleNavigation(content.button.path)}
            className="flex items-center gap-2 px-6 py-2 bg-zontaGold text-white font-medium rounded-lg shadow hover:bg-zontaRed transition"
          >
            {type === "membership" ? (
              <>
                <Users size={18} /> {content.button.label}
              </>
            ) : type === "scholarship" ? (
              <>
                <BookOpen size={18} /> {content.button.label}
              </>
            ) : (
              <>
                <ShoppingBag size={18} /> {content.button.label}
              </>
            )}
          </button>

          <button
            onClick={() => handleNavigation("/")}
            className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            <Home size={18} />
            Back to Home
          </button>
        </div>

        {/* Footer Message */}
        <p className="mt-12 text-sm text-gray-500">
          Thank you for supporting the{" "}
          <span className="text-zontaRed font-semibold">
            Zonta Club of Naples
          </span>{" "}
          💛
        </p>
      </main>
    </div>
  );
}
