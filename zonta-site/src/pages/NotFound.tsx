// src/pages/NotFound.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  const [redirect, setRedirect] = useState(false);

  // Auto-redirect after 3s using a render change (reliable)
  useEffect(() => {
    const t = setTimeout(() => setRedirect(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (redirect) {
    return <Navigate to="/" replace />;
  }

  const handleGoHome = () => {
    // Either trigger state redirect...
    setRedirect(true);
    // ...or use navigate("/") directly (both work)
    // navigate("/", { replace: true });
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-[80vh] text-center bg-white px-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-6 max-w-md">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>

      <motion.button
        onClick={handleGoHome}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-5 py-2.5 rounded-full bg-amber-500 text-white font-medium shadow-md hover:bg-amber-600 transition-colors"
      >
        Go Back Home
      </motion.button>

      <p className="text-sm text-gray-400 mt-4">
        Redirecting you automatically in 3 seconds...
      </p>
    </motion.div>
  );
}