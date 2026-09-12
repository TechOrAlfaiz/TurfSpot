import useDashboardData from "@hooks/admin/useDashboardData";
import StatCard from "./StatCard";
import BookingHistoryChart from "./BookingHistoryChart";
import AdminDashboardSkeleton from "./AdminDashboardSkeleton";
import {
  Users,
  Building,
  MapPin,
  CreditCard,
  UserPlus,
  UserX,
  TrendingUp,
  Sparkles,
  Calendar
} from "lucide-react";
import { useState } from "react";

const AdminDashboard = () => {
  const { data, loading, error } = useDashboardData();
  const [selectedTimeRange, setSelectedTimeRange] = useState("30");

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mesh-pattern pt-32 px-4 text-center">
        <div className="max-w-md mx-auto glass-panel p-8 rounded-3xl border border-rose-500/30 text-rose-300 font-bold">
          <p>Error loading dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const totalRevenue = data.bookingHistory.reduce((sum, day) => {
    return sum + day.amount;
  }, 0);

  return (
    <div className="min-h-screen bg-mesh-pattern text-slate-100 p-6 lg:p-10 relative overflow-hidden">
      {/* Background Decorative Ambient Glow Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-80 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10 pt-16 lg:pt-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Analytics & System Control</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Admin <span className="text-gradient-emerald">Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-300 border border-white/10 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Overview</span>
            </span>
          </div>
        </div>

        {/* Core Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Registered Users" value={data.totalUsers} icon={Users} />
          <StatCard title="Total Turf Owners" value={data.totalOwners} icon={Building} />
          <StatCard title="Active Turf Arenas" value={data.totalTurfs} icon={MapPin} />
          <StatCard title="Completed Bookings" value={data.totalBookings} icon={CreditCard} />
        </div>

        {/* Secondary Financial & Request Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard title="Pending Owner Requests" value={data.pendingRequests} icon={UserPlus} />
          <StatCard title="Rejected Requests" value={data.rejectedRequests} icon={UserX} />
          <StatCard title="Total System Revenue" value={totalRevenue} prefix="₹" icon={TrendingUp} />
        </div>

        {/* Booking History Chart Panel */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-extrabold text-white">Booking History Analytics</h2>
              <p className="text-xs text-slate-400">Track revenue and booking counts over time</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="px-4 py-2.5 rounded-xl bg-slate-900/80 text-white border border-white/10 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <BookingHistoryChart data={data.bookingHistory.slice(-selectedTimeRange)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
