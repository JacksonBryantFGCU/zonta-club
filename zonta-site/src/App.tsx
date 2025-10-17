import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Advocacy from "./pages/Advocacy";
import Scholarships from "./pages/Scholarships";
import Membership from "./pages/Membership";
import Action from "./pages/Action";
import Ecommerce from "./pages/Ecommerce";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import { CartProvider } from "./context/CartProvider";

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        <Navbar />
        <main className="pt-20 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/advocacy" element={<Advocacy />} />
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/action" element={<Action />} />
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