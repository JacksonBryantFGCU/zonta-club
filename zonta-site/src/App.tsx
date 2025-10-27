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
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartProvider";
import { useRouteProgress } from "./hooks/useRouteProgress";
import { useIsFetching } from "@tanstack/react-query";
import { useLoading } from "./hooks/useLoading";
import BackToTopButton from "./components/BackToTopButton";

// ✅ Import Admin V2 components
import AdminLayoutV2 from "./pages/AdminV2/AdminLayoutV2";
import DashboardHomeV2 from "./pages/AdminV2/DashboardHomeV2";
import OrdersV2 from "./pages/AdminV2/OrdersV2";
import ProductsV2 from "./pages/AdminV2/ProductsV2";
import EventsV2 from "./pages/AdminV2/EventsV2";
import ScholarshipsV2 from "./pages/AdminV2/ScholarshipsV2";
import MembershipsV2 from "./pages/AdminV2/MembershipsV2";
import SettingsV2 from "./pages/AdminV2/SettingsV2";
import AdminLoginV2 from "./pages/AdminV2/AdminLoginV2";

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
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const },
    },
    exit: {
      opacity: 0,
      y: -15,
      transition: { duration: 0.25, ease: [0.4, 0, 0.6, 1] as const },
    },
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        <Navbar />
        <main className="pt-20 flex-grow">
          <ScrollToTop />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* ---------- Public Routes ---------- */}
              <Route
                path="/"
                element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Home /></motion.div>}
              />
              <Route
                path="/about"
                element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><About /></motion.div>}
              />
              <Route
                path="/scholarships"
                element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Scholarships /></motion.div>}
              />
              <Route
                path="/membership"
                element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Membership /></motion.div>}
              />
              <Route
                path="/ecommerce"
                element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Ecommerce /></motion.div>}
              />
              <Route
                path="/product/:id"
                element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><ProductDetails /></motion.div>}
              />
              <Route
                path="/cart"
                element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Cart /></motion.div>}
              />
              <Route
                path="/success"
                element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><Success /></motion.div>}
              />

              {/* ---------- Admin V2 ---------- */}
              <Route path="/admin/login" element={<AdminLoginV2 />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayoutV2 />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHomeV2 />} />
                <Route path="orders" element={<OrdersV2 />} />
                <Route path="products" element={<ProductsV2 />} />
                <Route path="events" element={<EventsV2 />} />
                <Route path="scholarships" element={<ScholarshipsV2 />} />
                <Route path="memberships" element={<MembershipsV2 />} />
                <Route path="settings" element={<SettingsV2 />} />
              </Route>

              {/* ---------- 404 ---------- */}
              <Route
                path="*"
                element={<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"><NotFound /></motion.div>}
              />
            </Routes>
          </AnimatePresence>
          <BackToTopButton />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}