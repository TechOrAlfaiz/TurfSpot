import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut, Shield } from "lucide-react";
import ThemeSwitcher from "../common/ThemeSwitcher.jsx";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@redux/slices/authSlice.js";

const AuthenticatedNavbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state?.auth?.role);
  const path = role === "admin" ? "/admin" : "/owner";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <header className="glass-nav fixed top-0 left-0 right-0 z-40 px-6 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-circle lg:hidden text-slate-200" onClick={toggleSidebar}>
            <Menu size={22} />
          </button>
          <Link to={path} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="TurfSpot"
                className="w-full h-full object-cover rounded-[9px] bg-slate-900"
              />
            </div>
            <span className="text-xl font-extrabold text-gradient-emerald">
              TurfSpot Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-white/5 border border-white/10">
            <ThemeSwitcher />
          </div>

          <button
            className="glow-btn-secondary px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 text-emerald-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AuthenticatedNavbar;
