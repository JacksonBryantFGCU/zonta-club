import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Service from "./pages/Service";
import Advocacy from "./pages/Advocacy";
import Scholarships from "./pages/Scholarships";
import Membership from "./pages/Membership";
import Action from "./pages/Action";
import Ecommerce from "./pages/Ecommerce";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      {/* offset main content to avoid overlapping fixed navbar */}
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/service" element={<Service />} />
          <Route path="/advocacy" element={<Advocacy />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/action" element={<Action />} />
          <Route path="/ecommerce" element={<Ecommerce />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}