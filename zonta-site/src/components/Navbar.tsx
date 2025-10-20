import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ZontaLogo from "../assets/Zonta_emblem.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Who We Are", path: "/about" },
    { name: "Scholarships", path: "/scholarships" },
    { name: "Memberships", path: "/membership" },
    { name: "Ecommerce", path: "/ecommerce" },
  ];

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        window.location.href = "/admin";
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full bg-zontaGold shadow-md border-b border-zontaGold z-50">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-8 py-3">
        {/* ===== Left: Logo + Title ===== */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 text-zontaRed hover:opacity-90 transition whitespace-nowrap"
          >
            <img
              src={ZontaLogo}
              alt="Zonta Club Logo"
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
            />
            <span className="text-lg md:text-2xl font-bold tracking-wide">
              Zonta Club of Naples
            </span>
          </Link>
        </div>

        {/* ===== Desktop Navigation Links ===== */}
        <div className="hidden md:flex flex-nowrap justify-end items-center space-x-6 lg:space-x-8 whitespace-nowrap flex-grow ml-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
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
        </div>

        {/* ===== Mobile Menu Button ===== */}
        <button
          onClick={toggleMenu}
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
                  <NavLink
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block text-center font-medium transition-colors duration-200 ${
                        isActive
                          ? "text-white underline decoration-zontaRed decoration-2 underline-offset-4"
                          : "text-zontaRed hover:text-white"
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}