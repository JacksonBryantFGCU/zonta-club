// zonta-site/src/components/BackToTopButton.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="backToTop"
          onClick={scrollToTop}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed bottom-[16px] right-6 z-50 p-3 rounded-full shadow-lg bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
        >
          <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}>
                <ArrowUp size={22} />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}