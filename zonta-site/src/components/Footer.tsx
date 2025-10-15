import { Facebook, Instagram, Mail } from "lucide-react";
import ZontaLogo from "../assets/Zonta_emblem.png";

export default function Footer() {
  return (
    <footer className="bg-zontaGold text-zontaRed py-8 mt-20">
      <div className="container mx-auto px-4 text-center md:text-left">
        {/* Top Section — Logo, Name, Mission, and Social Media */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
          {/* Left: Logo + Name + Mission */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
            <div className="flex items-center gap-3">
              <img
                src={ZontaLogo}
                alt="Zonta Club Logo"
                className="w-12 h-12 md:w-14 md:h-14 object-contain"
              />
              <h2 className="text-2xl font-bold">Zonta Club of Naples</h2>
            </div>
            <p className="text-sm mt-2 text-zontaRed/90 max-w-sm">
              Empowering women through service and advocacy in the Naples
              community and beyond.
            </p>
          </div>

          {/* Right: Social Media */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <h3 className="font-semibold text-lg">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
                aria-label="Facebook"
              >
                <Facebook />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
                aria-label="Instagram"
              >
                <Instagram />
              </a>
              <a
                href="mailto:info@zontanaples.org"
                className="hover:text-white transition"
                aria-label="Email"
              >
                <Mail />
              </a>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-zontaRed/40 mt-8 pt-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Zonta Club of Naples. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}