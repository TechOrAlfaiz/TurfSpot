import { Link } from "react-router-dom";
import { Heart, Github, Mail, Shield, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-20 glass-nav border-t border-white/10 pt-12 pb-8 px-4 text-slate-300 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand info */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
              <img
                src="/logo.png"
                alt="TurfSpot"
                className="w-full h-full object-cover rounded-[9px] bg-slate-900"
              />
            </div>
            <span className="text-xl font-black text-gradient-emerald">TurfSpot</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Jaipur's premier sports-tech platform for booking FIFA-standard football turfs and floodlit box cricket arenas across Mansarovar, Vaishali Nagar, Malviya Nagar & 10+ neighborhoods.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-300">
            <span>📍 Proudly Serving Jaipur, Rajasthan</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link to="/turfs" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                <span>Explore Turfs</span>
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                <span>User Login</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Contact */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Support</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>mohdalfaiz1245@gmail.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>+91 (800) 123-4567</span>
            </li>
            <li className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Verified Arena Partner</span>
            </li>
          </ul>
        </div>

        {/* Developer Credit & Github */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Developed By</h4>
          <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span>Mohd Alfaiz</span>
            </div>
            <p className="text-xs text-slate-400">
              Full-Stack Developer & UI Enthusiast
            </p>
            <a
              href="https://github.com/TechOrAlfaiz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>github.com/TechOrAlfaiz</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>&copy; {new Date().getFullYear()} TurfSpot. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          <span>Crafted with</span>
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span>by</span>
          <a
            href="https://github.com/TechOrAlfaiz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 font-bold hover:underline"
          >
            Mohd Alfaiz
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
