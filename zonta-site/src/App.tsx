// zonta-site/src/App.tsx

import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MaintenanceWrapper from "./components/MaintenanceWrapper";
import AnnouncementBanner from "./components/AnnouncementBanner";
import { useAnnouncementBanner } from "./hooks/useAnnouncementBanner";
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
import Donate from "./pages/Donate";
import MembershipCancel from "./pages/MembershipCancel";

//  Import Admin components
import AdminLayout from "./pages/Admin/AdminLayout";
import DashboardHome from "./pages/Admin/DashboardHome";
import Orders from "./pages/Admin/Orders";
import Products from "./pages/Admin/Products";
import Events from "./pages/Admin/Events";
import ScholarshipsAdmin from "./pages/Admin/Scholarships/Scholarships";
import Memberships from "./pages/Admin/Memberships";
import Leadership from "./pages/Admin/Leadership";
import Donations from "./pages/Admin/Donations";
import Settings from "./pages/Admin/Settings";
import AdminLogin from "./pages/Admin/AdminLogin";
import MembershipApplicationPage from "./pages/Admin/MembershipApplications/MembershipApplications";
import ScholarshipApplicationPage from "./pages/Admin/ScholarshipApplications/ScholarshipApplications";
import ScholarshipApplication from "./pages/ScholarshipApplication";
import MembershipApplication from "./pages/MembershipApplication";

export default function App() {
  useRouteProgress();
  const isFetching = useIsFetching();
  const { startLoading, stopLoading } = useLoading();
  const { isVisible } = useAnnouncementBanner();

  const contentPadding = isVisible ? "pt-[110px]" : "pt-16";
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
      <MaintenanceWrapper>
        <div className="min-h-screen bg-white text-gray-900 flex flex-col">
          <AnnouncementBanner />
          <Navbar />
          <main
            className={`${contentPadding} flex-grow transition-all duration-300`}
          >
            <ScrollToTop />
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* ---------- Public Routes ---------- */}
                <Route
                  path="/"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <Home />
                    </motion.div>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <About />
                    </motion.div>
                  }
                />
                <Route
                  path="/scholarships"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <Scholarships />
                    </motion.div>
                  }
                />
                <Route
                  path="/scholarships/apply/:id"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <ScholarshipApplication />
                    </motion.div>
                  }
                />
                <Route
                  path="/membership"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <Membership />
                    </motion.div>
                  }
                />
                <Route
                  path="/membership/apply/:id"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <MembershipApplication />
                    </motion.div>
                  }
                />
                <Route
                  path="/donate"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <Donate />
                    </motion.div>
                  }
                />
                <Route
                  path="/ecommerce"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <Ecommerce />
                    </motion.div>
                  }
                />
                <Route
                  path="/product/:id"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <ProductDetails />
                    </motion.div>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <Cart />
                    </motion.div>
                  }
                />
                <Route
                  path="/success"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <Success />
                    </motion.div>
                  }
                />
                <Route
                  path="/membership-cancel"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <MembershipCancel />
                    </motion.div>
                  }
                />

                {/* ---------- Admin Routes ---------- */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="products" element={<Products />} />
                  <Route path="donations" element={<Donations />} />
                  <Route path="events" element={<Events />} />
                  <Route path="scholarships" element={<ScholarshipsAdmin />} />
                  <Route
                    path="scholarship-applications"
                    element={<ScholarshipApplicationPage />}
                  />
                  <Route path="memberships" element={<Memberships />} />
                  <Route
                    path="membership-application"
                    element={<MembershipApplicationPage />}
                  />
                  <Route path="leadership" element={<Leadership />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* ---------- 404 Page ---------- */}
                <Route
                  path="*"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <NotFound />
                    </motion.div>
                  }
                />
              </Routes>
            </AnimatePresence>
            <BackToTopButton />
          </main>
          <Footer />
        </div>
      </MaintenanceWrapper>
    </CartProvider>
  );
}
