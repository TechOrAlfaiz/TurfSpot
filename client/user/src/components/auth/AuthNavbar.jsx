import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ThemeSwitcher from "../common/ThemeSwitcher.jsx";
import LocationSelectorModal from "../common/LocationSelectorModal.jsx";
import useUserLocation from "../../hooks/useUserLocation.jsx";
import { logout } from "../../redux/slices/authSlice.js";
import { useDispatch } from "react-redux";
import { LogOut, Home as HomeIcon, MapPin, CalendarCheck, ShieldPlus, Menu, ChevronDown, Crosshair } from "lucide-react";

export default function AuthNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { areaName, isGPS } = useUserLocation();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto glass-nav rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl border border-white/10">
          
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-4">
            <Link to="/auth" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo.png"
                  alt="TurfSpot"
                  className="w-full h-full object-cover rounded-[10px] bg-slate-950"
                />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-gradient-emerald">
                  TurfSpot
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-emerald-400/80 uppercase -mt-1 hidden sm:block">
                  Player Hub
                </span>
              </div>
            </Link>

            {/* Location Selector Button */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800/80 border border-emerald-500/30 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-md group"
            >
              {isGPS ? (
                <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
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
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-full border border-white/10 backdrop-blur-xl">
          <Link
            to="/auth"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              isActive("/auth")
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 font-bold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <Link
            to="/auth/turfs"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              isActive("/auth/turfs")
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 font-bold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Turfs</span>
          </Link>

          <Link
            to="/auth/booking-history"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              isActive("/auth/booking-history")
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 font-bold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>My Bookings</span>
          </Link>

          <Link
            to="/auth/become-owner"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              isActive("/auth/become-owner")
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 font-bold"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldPlus className="w-4 h-4" />
            <span>Become Owner</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 transition-colors">
            <ThemeSwitcher />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Mobile Menu Dropdown */}
          <div className="dropdown dropdown-end lg:hidden">
            <label tabIndex={0} className="btn btn-ghost btn-circle text-slate-200 hover:bg-white/10">
              <Menu className="h-6 w-6" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content mt-3 z-[1] p-3 glass-panel rounded-2xl w-56 space-y-2 border border-white/15 shadow-2xl backdrop-blur-2xl"
            >
              <li>
                <Link
                  to="/auth"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium ${
                    isActive("/auth") ? "bg-emerald-500/20 text-emerald-300" : "hover:bg-white/5 text-slate-200"
                  }`}
                >
                  <HomeIcon className="w-4 h-4 text-emerald-400" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/turfs"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium ${
                    isActive("/auth/turfs") ? "bg-emerald-500/20 text-emerald-300" : "hover:bg-white/5 text-slate-200"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Turfs
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/booking-history"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium ${
                    isActive("/auth/booking-history") ? "bg-emerald-500/20 text-emerald-300" : "hover:bg-white/5 text-slate-200"
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 text-emerald-400" />
                  My Bookings
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/become-owner"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium ${
                    isActive("/auth/become-owner") ? "bg-emerald-500/20 text-emerald-300" : "hover:bg-white/5 text-slate-200"
                  }`}
                >
                  <ShieldPlus className="w-4 h-4 text-emerald-400" />
                  Become Owner
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <LocationSelectorModal
      isOpen={isLocationModalOpen}
      onClose={() => setIsLocationModalOpen(false)}
    />
  </>
  );
}

