import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Building,
  Calendar,
  Clock,
  CreditCard,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Tag,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  Edit2,
  X,
  Loader2,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  Moon,
  Trophy
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1234/api";

const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const [loadingTurfs, setLoadingTurfs] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState({ totalRevenue: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [bookingSearch, setBookingSearch] = useState("");

  // Edit Availability Modal State
  const [editModalTurf, setEditModalTurf] = useState(null);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [isLateNight, setIsLateNight] = useState(false);
  const [pricePerHour, setPricePerHour] = useState("");
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const getOwnerAuthHeader = () => {
    const token = localStorage.getItem("ownerToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleLogout = () => {
    localStorage.removeItem("ownerToken");
    localStorage.removeItem("ownerRole");
    toast.success("Owner logged out successfully.");
    navigate("/login");
  };

  // Fetch Owner's Turfs (Scoped strictly to authenticated owner)
  const fetchOwnerTurfs = useCallback(async () => {
    setLoadingTurfs(true);
    try {
      const response = await axios.get(
        `${API_BASE}/owner/dashboard/my-turfs`,
        getOwnerAuthHeader()
      );
      setTurfs(response.data.turfs || []);
    } catch (err) {
      console.error("Error fetching owner turfs:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        toast.error("Failed to load your turfs.");
      }
    } finally {
      setLoadingTurfs(false);
    }
  }, []);

  // Fetch Bookings for Owner's Turfs (Scoped strictly to authenticated owner)
  const fetchOwnerBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const response = await axios.get(
        `${API_BASE}/owner/dashboard/bookings`,
        getOwnerAuthHeader()
      );
      setBookings(response.data.bookings || []);
      if (response.data.stats) {
        setBookingStats(response.data.stats);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    fetchOwnerTurfs();
    fetchOwnerBookings();
  }, [fetchOwnerTurfs, fetchOwnerBookings]);

  // Open Edit Availability Modal
  const handleOpenEdit = (turf) => {
    setEditModalTurf(turf);
    setOpenTime(turf.openTime || "06:00");
    setCloseTime(turf.closeTime || "02:00");
    setIsLateNight(Boolean(turf.lateNightAvailable || turf.isLateNight));
    setPricePerHour(turf.pricePerHour || 1000);
  };

  // Save Availability Updates
  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    if (!editModalTurf) return;

    setUpdatingAvailability(true);
    try {
      const response = await axios.put(
        `${API_BASE}/owner/dashboard/turf/${editModalTurf._id}/availability`,
        {
          openTime,
          closeTime,
          isLateNight,
          pricePerHour: Number(pricePerHour),
        },
        getOwnerAuthHeader()
      );

      if (response.data.success) {
        toast.success(response.data.message || "Turf schedule and pricing updated!");
        setEditModalTurf(null);
        fetchOwnerTurfs();
      }
    } catch (err) {
      console.error("Error updating turf availability:", err);
      toast.error(err.response?.data?.message || "Failed to update availability.");
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = bookingSearch.toLowerCase();
    return (
      b.bookingReference?.toLowerCase().includes(q) ||
      b.customerName?.toLowerCase().includes(q) ||
      b.turfName?.toLowerCase().includes(q) ||
      b.sport?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background Ambient Glows matching Login & Site Palette */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-96 left-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 pt-2">
        {/* Top Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>Partner Arena Management Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Owner <span className="text-gradient-emerald">Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live ground performance, match reservations, hourly rates, and midnight availability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchOwnerTurfs();
                fetchOwnerBookings();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white border border-white/10 flex items-center gap-2 transition-colors shadow-sm"
            >
              <RefreshCw
                size={14}
                className={loadingTurfs || loadingBookings ? "animate-spin text-emerald-400" : "text-emerald-400"}
              />
              <span>Refresh Stats</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-400 border border-rose-500/30 flex items-center gap-2 transition-colors shadow-sm"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* High-Impact Stat Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl glass-panel border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Managed Arenas</span>
              <Building className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-3xl font-black text-white mt-2 block tracking-tight">
              {turfs.length}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Live registered facilities</span>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Total Reservations</span>
              <Calendar className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-3xl font-black text-cyan-400 mt-2 block tracking-tight">
              {bookings.length}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Player match bookings</span>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Confirmed Matches</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-3xl font-black text-emerald-400 mt-2 block tracking-tight">
              {bookingStats.confirmed}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Upcoming games with entry passes</span>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Total Revenue</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-3xl font-black text-amber-400 mt-2 block tracking-tight">
              ₹{(bookingStats.totalRevenue || 0).toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Gross booking proceeds</span>
          </div>
        </div>

        {/* SECTION 1: My Managed Turfs Grid & Availability Editor */}
        <div className="glass-panel border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>My Registered Arenas</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust operating slots, late-night hours, and hourly match rates in real time.
              </p>
            </div>
          </div>

          {loadingTurfs ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-2" />
              <span className="text-xs">Loading your arenas...</span>
            </div>
          ) : turfs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl">
              <p className="text-xs font-semibold">No turfs linked to this owner account yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Approved applications will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {turfs.map((turf) => {
                const isActive = turf.isActive !== false;
                const photo = turf.image || turf.images?.[0] || "/banner-1.png";

                return (
                  <div
                    key={turf._id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo Thumbnail */}
                      <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-slate-800">
                        <img src={photo} alt={turf.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/banner-1.png"; }} />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-900/90 text-white border border-white/10">
                          {isActive ? "Live" : "Paused"}
                        </div>
                        <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-md">
                          ₹{turf.pricePerHour || 1000}/hr
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-extrabold text-white text-base leading-snug">{turf.name}</h3>
                      </div>

                      <p className="text-xs text-slate-400 flex items-start gap-1 mb-2">
                        <MapPin size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{turf.address || turf.area || "Jaipur"}</span>
                      </p>

                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Hours:</span>
                          <span className="font-semibold text-white">
                            {turf.openTime || "06:00"} - {turf.closeTime || "02:00"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Late-Night:</span>
                          <span
                            className={`font-semibold ${
                              turf.lateNightAvailable ? "text-emerald-400" : "text-slate-400"
                            }`}
                          >
                            {turf.lateNightAvailable ? "✓ Active (Past 12 AM)" : "Standard"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Sports:</span>
                          <span className="font-semibold text-cyan-400">
                            {turf.sportTypes?.join(", ") || "Cricket, Football"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                      <a
                        href={`/turf/${turf._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                      >
                        <span>View Page</span>
                        <ExternalLink size={12} />
                      </a>

                      <button
                        onClick={() => handleOpenEdit(turf)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 size={12} />
                        <span>Edit Schedule</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: Customer Bookings & Payment Breakdown */}
        <div className="glass-panel border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>Live Customer Bookings</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time match schedule and payment settlement logs for your arenas.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search by customer, ref, or turf..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {loadingBookings ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-2" />
              <span className="text-xs">Loading customer bookings...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl">
              <p className="text-xs font-semibold">No bookings found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Turf Arena</th>
                    <th className="py-3 px-4">Player Details</th>
                    <th className="py-3 px-4">Slot & Sport</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Match Status</th>
                    <th className="py-3 px-4">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBookings.map((b) => (
                    <tr key={b.id || b._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-white text-xs">
                        {b.bookingReference || b._id?.slice(-8)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-200">
                        {b.turfName || "Arena"}
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="font-bold text-white">{b.customerName || b.user?.name || "Player"}</div>
                        <div className="text-slate-400 text-[11px]">{b.customerPhone || b.user?.phone || b.customerEmail || ""}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        <div className="font-semibold">{b.bookingDate || b.date}</div>
                        <div className="text-[11px] text-slate-400">
                          {b.slotTime || `${b.startTime} - ${b.endTime}`} ({b.sport || "Cricket"})
                        </div>
                      </td>
                      <td className="py-4 px-4 font-black text-emerald-400 text-sm">
                        ₹{b.totalPrice || 0}
                      </td>
                      <td className="py-4 px-4">
                        {b.status === "CONFIRMED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={11} /> Confirmed
                          </span>
                        ) : b.status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <XCircle size={11} /> {b.status}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {b.paymentStatus === "SUCCESS" || b.paymentStatus === "PAID" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            PAID
                          </span>
                        ) : b.paymentStatus === "REFUNDED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            REFUNDED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            PENDING
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Availability & Schedule Modal */}
      {editModalTurf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-lg tracking-tight">
                <Clock className="w-5 h-5" />
                <span>Adjust Hours & Pricing</span>
              </div>
              <button
                onClick={() => setEditModalTurf(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Updating schedule and pricing for <strong className="text-white">{editModalTurf.name}</strong>.
            </p>

            <form onSubmit={handleSaveAvailability} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">
                    Opening Time
                  </label>
                  <input
                    type="text"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    placeholder="06:00"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">
                    Closing Time
                  </label>
                  <input
                    type="text"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    placeholder="02:00"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">
                  Hourly Match Rate (₹)
                </label>
                <input
                  type="number"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                  placeholder="1000"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-white/10">
                <input
                  type="checkbox"
                  id="isLateNight"
                  checked={isLateNight}
                  onChange={(e) => setIsLateNight(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-white/20"
                />
                <label htmlFor="isLateNight" className="text-slate-300 font-semibold cursor-pointer text-xs">
                  Enable Late-Night Availability (Slots Past 12:00 AM)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditModalTurf(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingAvailability}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                >
                  {updatingAvailability ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Save Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardPage;
