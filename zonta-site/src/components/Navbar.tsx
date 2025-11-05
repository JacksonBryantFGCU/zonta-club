import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ZontaLogo from "../assets/Zonta_emblem.png";
import { useAnnouncementBanner } from "../hooks/useAnnouncementBanner";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { isVisible } = useAnnouncementBanner();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Who We Are", path: "/about" },
    { name: "Scholarships", path: "/scholarships" },
    { name: "Memberships", path: "/membership" },
    { name: "Ecommerce", path: "/ecommerce" },
  ];

  // ✅ Smooth background + shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Keyboard shortcut to go to /admin (Ctrl + Shift + A)
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        navigate("/admin");
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [navigate]);

  // ✅ Close mobile menu when navigating
  const handleNavClick = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed left-0 w-full z-40 transition-all duration-300 border-b border-zontaGold ${
        isVisible ? "top-[46px]" : "top-0"
      } ${
        scrolled
          ? "bg-zontaGold/90 shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-sm"
          : "bg-zontaGold shadow-none"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-8 py-3">
        {/* ===== Left: Logo + Title ===== */}
        <button
          onClick={() => handleNavClick("/")}
          className="flex items-center gap-3 text-zontaRed hover:opacity-90 transition whitespace-nowrap focus:outline-none"
        >
          <img
            src={ZontaLogo}
            alt="Zonta Club Logo"
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
          <span className="text-lg md:text-2xl font-bold tracking-wide">
            Zonta Club of Naples
          </span>
        </button>

        {/* ===== Desktop Navigation ===== */}
        <div className="hidden md:flex flex-nowrap justify-end items-center space-x-6 lg:space-x-8 whitespace-nowrap flex-grow ml-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-white underline decoration-zontaRed decoration-2 underline-offset-4"
                    : "text-zontaRed hover:text-white"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* ✅ Donate Button (highlighted) */}
          <button
            onClick={() => handleNavClick("/donate")}
            className="ml-4 bg-zontaRed text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-zontaDark transition-all duration-300"
          >
            Donate
          </button>
        </div>

        {/* ===== Mobile Menu Button ===== */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-zontaRed focus:outline-none ml-2"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* ===== Animated Mobile Dropdown ===== */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="md:hidden bg-zontaGold border-t border-zontaRed shadow-md"
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              className="flex flex-col items-center py-4 space-y-3"
            >
              {navLinks.map((link) => (
                <motion.li
                  key={link.name}
                  variants={{
                    hidden: { opacity: 0, y: -5 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <button
                    onClick={() => handleNavClick(link.path)}
                    className={`block text-center font-medium transition-colors duration-200 ${
                      location.pathname === link.path
                        ? "text-white underline decoration-zontaRed decoration-2 underline-offset-4"
                        : "text-zontaRed hover:text-white"
                    }`}
                  >
                    {link.name}
                  </button>
                </motion.li>
              ))}

              {/* ✅ Mobile Donate Button */}
              <motion.li
                key="Donate"
                variants={{
                  hidden: { opacity: 0, y: -5 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <button
                  onClick={() => handleNavClick("/donate")}
                  className="mt-2 bg-zontaRed text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-zontaDark transition-all duration-300"
                >
                  Donate
                </button>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}