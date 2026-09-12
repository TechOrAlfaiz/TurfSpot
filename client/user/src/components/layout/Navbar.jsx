import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeSwitcher from "../common/ThemeSwitcher";
import LocationSelectorModal from "../common/LocationSelectorModal";
import useUserLocation from "../../hooks/useUserLocation";
import { Sparkles, Home as HomeIcon, MapPin, LogIn, Compass, ChevronDown, Crosshair } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const { areaName, isGPS } = useUserLocation();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto glass-nav rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl border border-white/10">
          
          {/* Brand Logo & Location Trigger */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30 group-hover:scale-105 group-hover:shadow-emerald-500/50 transition-all duration-300">
                <img
                  src="/logo.png"
                  alt="TurfSpot"
                  className="w-full h-full object-cover rounded-[10px] bg-slate-950"
                />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-gradient-emerald">
                  TurfSpot
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-emerald-400/80 uppercase -mt-1 hidden sm:block">
                  Jaipur Sports
                </span>
              </div>
            </Link>

            {/* Interactive Location Selector Button */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800/80 border border-emerald-500/30 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-md group"
            >
              {isGPS ? (
                <Crosshair className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="max-w-[120px] sm:max-w-[160px] truncate">
                {areaName ? `${areaName}, Jaipur` : "Jaipur, Rajasthan"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-full border border-white/10 backdrop-blur-xl">
            <Link
              to="/"
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                isActive("/")
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/turfs"
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                isActive("/turfs")
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Turfs</span>
            </Link>
          </nav>

          {/* Right Nav Actions */}
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 transition-colors">
              <ThemeSwitcher />
            </div>

            <Link
              to="/login"
              className="glow-btn flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white tracking-wide shadow-lg shadow-emerald-500/25"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>

            {/* Mobile Menu Icon / Dropdown */}
            <div className="dropdown dropdown-end md:hidden">
              <label tabIndex={0} className="btn btn-ghost btn-circle text-slate-200 hover:bg-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content mt-3 z-[1] p-3 glass-panel rounded-2xl w-56 space-y-2 border border-white/15 shadow-2xl backdrop-blur-2xl"
              >
                <li>
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium w-full text-left text-emerald-300 hover:bg-white/5"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Change Area</span>
                  </button>
                </li>
                <li>
                  <Link
                    to="/"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium ${
                      isActive("/") ? "bg-emerald-500/20 text-emerald-300" : "hover:bg-white/5 text-slate-200"
                    }`}
                  >
                    <HomeIcon className="w-4 h-4 text-emerald-400" />
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/turfs"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium ${
                      isActive("/turfs") ? "bg-emerald-500/20 text-emerald-300" : "hover:bg-white/5 text-slate-200"
                    }`}
                  >
                    <Compass className="w-4 h-4 text-emerald-400" />
                    Explore Turfs
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
};

export default Navbar;

