import { Routes, Route } from "react-router-dom";
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
import { useEffect } from "react";

export default function App() {
  useRouteProgress();
  const isFetching = useIsFetching();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    if (isFetching > 0) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [isFetching, startLoading, stopLoading]);

  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        <Navbar />
        <main className="pt-20 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AdminLogin />} />

            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<About />} />
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/ecommerce" element={<Ecommerce />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}