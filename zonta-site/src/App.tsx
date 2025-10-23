import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Scholarships from "./pages/Scholarships";
import Membership from "./pages/Membership";
import Ecommerce from "./pages/Ecommerce";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/AdminLogin";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import { CartProvider } from "./context/CartProvider";
import { useRouteProgress } from "./hooks/useRouteProgress";
import { useIsFetching } from "@tanstack/react-query";
import { useLoading } from "./hooks/useLoading";
import BackToTopButton from "./components/BackToTopButton";
import NotFound from "./pages/NotFound";

export default function App() {
  useRouteProgress();
  const isFetching = useIsFetching();
  const { startLoading, stopLoading } = useLoading();
  const location = useLocation();

  useEffect(() => {
    if (isFetching > 0) startLoading();
    else stopLoading();
  }, [isFetching, startLoading, stopLoading]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: [0.4, 0, 0.6, 1] as const } },
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        <Navbar />
        <main className="pt-20 flex-grow">
          <ScrollToTop />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {[
                { path: "/", element: <Home /> },
                { path: "/about", element: <About /> },
                { path: "/scholarships", element: <Scholarships /> },
                { path: "/membership", element: <Membership /> },
                { path: "/ecommerce", element: <Ecommerce /> },
                { path: "/product/:id", element: <ProductDetails /> },
                { path: "/cart", element: <Cart /> },
                { path: "/success", element: <Success /> },
                { path: "/login", element: <AdminLogin /> },
                {
                  path: "/admin",
                  element: (
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  ),
                },
                { path: "*", element: <NotFound /> },
              ].map(({ path, element }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="min-h-[80vh]"
                    >
                      {element}
                    </motion.div>
                  }
                />
              ))}
            </Routes>
          </AnimatePresence>
          <BackToTopButton />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}