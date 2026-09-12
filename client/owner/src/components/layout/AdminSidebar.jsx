import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  X,
  Home,
  Users,
  Building,
  MapPin,
  DollarSign,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles
} from "lucide-react";

const AdminSidebar = ({ isOpen, toggleSidebar, className }) => {
  const location = useLocation();
  const [ownerRequestsOpen, setOwnerRequestsOpen] = useState(true);

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: Home },
    {
      label: "Owner Requests",
      icon: UserPlus,
      subItems: [
        { to: "/admin/owner-requests/new", label: "New Requests" },
        { to: "/admin/owner-requests/rejected", label: "Rejected Requests" },
      ],
    },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/owners", label: "Owners", icon: Building },
    { to: "/admin/turfs", label: "Turfs", icon: MapPin },
    { to: "/admin/transactions", label: "Transactions", icon: DollarSign },
  ];

  const toggleOwnerRequests = () => {
    setOwnerRequestsOpen(!ownerRequestsOpen);
  };

  const renderNavItem = (item) => {
    if (item.subItems) {
      return (
        <div key={item.label} className="space-y-1">
          <button
            onClick={toggleOwnerRequests}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-emerald-400" />
              <span>{item.label}</span>
            </div>
            {ownerRequestsOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {ownerRequestsOpen && (
            <div className="ml-5 pl-4 border-l border-white/10 space-y-1">
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.to}
                  to={subItem.to}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    location.pathname === subItem.to
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                >
                  {subItem.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    const isActive = location.pathname === item.to;

    return (
      <Link
        key={item.to}
        to={item.to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
            : "text-slate-300 hover:text-white hover:bg-white/5"
        }`}
        onClick={() => {
          if (window.innerWidth < 1024) {
            toggleSidebar();
          }
        }}
      >
        <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-emerald-400"}`} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className={`${className} glass-panel border-r border-white/10 overflow-y-auto fixed lg:static
          w-64 transition-transform duration-300 ease-in-out z-30 lg:z-0
          min-h-screen text-slate-100 flex flex-col justify-between p-4`}
    >
      <div>
        <div className="flex items-center justify-between p-3 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold text-gradient-emerald block">TurfSpot</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400/80">Admin Portal</span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1">{navItems.map(renderNavItem)}</nav>
      </div>

      <div className="p-4 rounded-2xl glass-panel border border-white/10 mt-8 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <Sparkles className="w-4 h-4" />
          <span>Admin Controls</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal">
          Logged in as System Administrator with full access rights.
        </p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
