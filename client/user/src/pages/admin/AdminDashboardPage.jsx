import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Shield,
  Users,
  Building,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock3,
  Copy,
  Check,
  LogOut,
  Sparkles,
  RefreshCw,
  Search,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Key,
  X,
  Eye,
  Calendar,
  Phone,
  Mail,
  Loader2,
  ExternalLink,
  Tag,
  Compass,
  CheckSquare
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1234/api";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingTurfs, setLoadingTurfs] = useState(true);
  const [requests, setRequests] = useState({ pending: [], approved: [], rejected: [] });
  const [turfs, setTurfs] = useState([]);
  const [turfSearch, setTurfSearch] = useState("");

  // Inspect Venue Request Modal State (Part B Admin detail view)
  const [inspectModal, setInspectModal] = useState(null);
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState(null);

  // Credentials Modal State
  const [credentialsModal, setCredentialsModal] = useState(null);
  const [copied, setCopied] = useState(false);

  // Reject Modal State
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const getAdminAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    toast.success("Admin logged out successfully.");
    navigate("/login");
  };

  // Fetch Become Owner Requests
  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const response = await axios.get(
        `${API_BASE}/admin/owner-requests/list`,
        getAdminAuthHeader()
      );
      const data = response.data;
      setRequests({
        pending: data.ownerRequests || [],
        approved: data.ownerApprovedRequests || [],
        rejected: data.ownerRejectedRequests || [],
      });
    } catch (err) {
      console.error("Error fetching requests:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        toast.error("Failed to load owner requests.");
      }
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  // Fetch All Platform Turfs
  const fetchTurfs = useCallback(async () => {
    setLoadingTurfs(true);
    try {
      const response = await axios.get(
        `${API_BASE}/admin/turfs/all`,
        getAdminAuthHeader()
      );
      setTurfs(response.data.turfs || []);
    } catch (err) {
      console.error("Error fetching turfs:", err);
    } finally {
      setLoadingTurfs(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchTurfs();
  }, [fetchRequests, fetchTurfs]);

  // Handle Approve Owner Request
  const handleApproveRequest = async (requestId) => {
    setActionLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE}/admin/owner-requests/${requestId}/accept`,
        {},
        getAdminAuthHeader()
      );

      if (response.data.success) {
        toast.success(response.data.message || "Owner approved and Turf created!");
        setCredentialsModal(response.data.credentials);
        if (inspectModal?._id === requestId) {
          setInspectModal(null);
        }
        fetchRequests();
        fetchTurfs();
      }
    } catch (err) {
      console.error("Error approving owner:", err);
      toast.error(err.response?.data?.message || "Failed to approve owner.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Owner Request
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModal) return;

    setActionLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE}/admin/owner-requests/${rejectModal._id}`,
        {
          ...getAdminAuthHeader(),
          data: { reason: rejectReason.trim() },
        }
      );

      if (response.data.success) {
        toast.success("Owner request marked as rejected.");
        setRejectModal(null);
        if (inspectModal?._id === rejectModal._id) {
          setInspectModal(null);
        }
        setRejectReason("");
        fetchRequests();
      }
    } catch (err) {
      console.error("Error rejecting owner:", err);
      toast.error(err.response?.data?.message || "Failed to reject request.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Turf Active/Inactive Toggle
  const handleToggleTurf = async (turfId) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/admin/turfs/${turfId}/toggle-active`,
        {},
        getAdminAuthHeader()
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setTurfs((prev) =>
          prev.map((t) => (t._id === turfId ? { ...t, isActive: !t.isActive } : t))
        );
      }
    } catch (err) {
      console.error("Error toggling turf status:", err);
      toast.error("Failed to update turf status.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTurfs = turfs.filter((t) => {
    const q = turfSearch.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.address?.toLowerCase().includes(q) ||
      t.area?.toLowerCase().includes(q) ||
      t.owner?.name?.toLowerCase().includes(q)
    );
  });

  const displayedRequests =
    activeTab === "pending"
      ? requests.pending
      : activeTab === "approved"
      ? requests.approved
      : requests.rejected;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background Ambient Glows matching Login & Site Palette */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-96 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 pt-2">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Platform Governance Console</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Admin <span className="text-gradient-emerald">Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Verify arena onboarding requests, inspect photos & map pins, and manage live platform venues.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchRequests();
                fetchTurfs();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white border border-white/10 flex items-center gap-2 transition-colors shadow-sm"
            >
              <RefreshCw
                size={14}
                className={loadingRequests || loadingTurfs ? "animate-spin text-emerald-400" : "text-emerald-400"}
              />
              <span>Refresh Data</span>
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

        {/* High-Impact Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl glass-panel border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Pending Review</span>
              <Clock3 className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-3xl font-black text-amber-400 mt-2 block tracking-tight">
              {requests.pending.length}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Awaiting physical verification</span>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Approved Partners</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-3xl font-black text-emerald-400 mt-2 block tracking-tight">
              {requests.approved.length}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Verified arena operators</span>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Total Arenas Listed</span>
              <Building className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-3xl font-black text-white mt-2 block tracking-tight">
              {turfs.length}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Catalog inventory in Jaipur</span>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Live Active Turfs</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-3xl font-black text-cyan-400 mt-2 block tracking-tight">
              {turfs.filter((t) => t.isActive !== false).length}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Bookable by players now</span>
          </div>
        </div>

        {/* SECTION 1: Become Owner Requests Queue with Detail Inspection */}
        <div className="glass-panel border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                <Building className="w-5 h-5 text-emerald-400" />
                <span>"Become Owner" Applications</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect physical ground photos, pinned map location, and contact details before approving.
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10">
              {[
                { id: "pending", label: "Pending", count: requests.pending.length, color: "text-amber-400" },
                { id: "approved", label: "Approved", count: requests.approved.length, color: "text-emerald-400" },
                { id: "rejected", label: "Rejected", count: requests.rejected.length, color: "text-rose-400" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900/90 font-black ${tab.color}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Requests Content Table */}
          {loadingRequests ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-2" />
              <span className="text-xs">Loading partner applications...</span>
            </div>
          ) : displayedRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl">
              <p className="text-xs font-semibold">No {activeTab} partner applications found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Turf & Applicant</th>
                    <th className="py-3 px-4">Address & Location</th>
                    <th className="py-3 px-4">Photos</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayedRequests.map((req) => {
                    const photosCount = req.images?.length || (req.image ? 1 : 0);
                    const coords = req.location?.coordinates || [75.7684, 26.8533];

                    return (
                      <tr key={req._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-extrabold text-white text-sm">
                            {req.turfName || `${req.name}'s Turf`}
                          </div>
                          <div className="text-slate-400 text-xs mt-0.5">{req.name}</div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Mail size={11} className="text-emerald-400" />
                              {req.email}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone size={11} className="text-emerald-400" />
                              {req.phone}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          <div className="flex items-start gap-1.5 text-slate-300">
                            <MapPin size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              {req.address || req.turfLocation || "Jaipur, Rajasthan"}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-1">
                            Coordinates: {coords[1]?.toFixed(4)}° N, {coords[0]?.toFixed(4)}° E
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {photosCount > 0 ? (
                            <button
                              onClick={() => setInspectModal(req)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition-colors"
                            >
                              <span>📷 {photosCount} Photo{photosCount > 1 ? "s" : ""}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500">No photos</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-slate-400 text-[11px]">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-4 px-4">
                          {req.status === "approved" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 size={12} /> Approved
                            </span>
                          ) : req.status === "rejected" ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                <XCircle size={12} /> Rejected
                              </span>
                              {req.rejectionReason && (
                                <p className="text-[10px] text-slate-400 mt-1 max-w-xs truncate">
                                  {req.rejectionReason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Clock3 size={12} /> Pending Review
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Inspect Details Button */}
                            <button
                              onClick={() => setInspectModal(req)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 flex items-center gap-1 transition-colors"
                              title="Inspect full venue application"
                            >
                              <Eye size={13} className="text-emerald-400" />
                              <span>Inspect</span>
                            </button>

                            {req.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApproveRequest(req._id)}
                                  disabled={actionLoading}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-md shadow-emerald-600/20"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => setRejectModal(req)}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {req.status === "approved" && req.generatedCredentials && (
                              <button
                                onClick={() => setCredentialsModal(req.generatedCredentials)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-white/10 flex items-center gap-1"
                              >
                                <Key size={12} className="text-emerald-400" />
                                <span>Credentials</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 2: Platform Turf Management (List & Active Toggle) */}
        <div className="glass-panel border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>Live Platform Turfs</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle active/inactive status to instantly show or hide venues from player search and proximity maps.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={turfSearch}
                onChange={(e) => setTurfSearch(e.target.value)}
                placeholder="Search by turf name or area..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {loadingTurfs ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-2" />
              <span className="text-xs">Loading turf venues...</span>
            </div>
          ) : filteredTurfs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl">
              <p className="text-xs font-semibold">No turfs match your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTurfs.map((turf) => {
                const isActive = turf.isActive !== false;
                const coords = turf.location?.coordinates || [75.7684, 26.8533];

                return (
                  <div
                    key={turf._id}
                    className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                      isActive
                        ? "bg-slate-900/60 border-white/10 hover:border-emerald-500/30"
                        : "bg-slate-950/80 border-rose-500/20 opacity-75"
                    }`}
                  >
                    <div>
                      {/* Photo Thumbnail */}
                      <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-slate-800">
                        <img
                          src={turf.image || turf.images?.[0] || "/banner-1.png"}
                          alt={turf.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/banner-1.png";
                          }}
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-900/90 text-white border border-white/10">
                          {isActive ? "Active" : "Paused"}
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white">
                          ₹{turf.pricePerHour || 1000}/hr
                        </div>
                      </div>

                      <h3 className="font-extrabold text-white text-base leading-snug">{turf.name}</h3>

                      <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                        <MapPin size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{turf.address || turf.area || "Jaipur"}</span>
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                        <span>Sports: {turf.sportTypes?.join(", ") || "Cricket, Football"}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                      <a
                        href={`/turf/${turf._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        <span>View Public Page</span>
                        <ExternalLink size={12} />
                      </a>

                      <button
                        onClick={() => handleToggleTurf(turf._id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isActive
                            ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        <span>{isActive ? "Pause" : "Activate"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PART B ADMIN DETAIL INSPECTION MODAL: Address, Map Pin, and Photos */}
      {inspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <span>Physical Venue Inspection</span>
                </div>
                <h3 className="text-xl font-black text-white">{inspectModal.turfName || `${inspectModal.name}'s Venue`}</h3>
              </div>
              <button
                onClick={() => setInspectModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Applicant Profile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-white/10 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Owner Name</span>
                <span className="text-white font-bold">{inspectModal.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Contact Email</span>
                <span className="text-emerald-400 font-bold">{inspectModal.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Phone Number</span>
                <span className="text-white font-bold">{inspectModal.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Base Hourly Rate</span>
                <span className="text-amber-400 font-bold">₹{inspectModal.pricePerHour || 1000}/hour</span>
              </div>
            </div>

            {/* Address & Pinned Map Coordinates */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
                Physical Ground Address & Coordinates
              </span>
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                <div className="flex items-start gap-2 text-slate-200">
                  <MapPin size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{inspectModal.address || inspectModal.turfLocation || "Jaipur, Rajasthan"}</span>
                </div>
                {inspectModal.location?.coordinates && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                    <span className="text-slate-400">GPS Coordinates:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {inspectModal.location.coordinates[1]?.toFixed(5)}° N,{" "}
                      {inspectModal.location.coordinates[0]?.toFixed(5)}° E
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${inspectModal.location.coordinates[1]},${inspectModal.location.coordinates[0]}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open in Satellite</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Photos Gallery */}
            <div className="space-y-2">
              <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
                Submitted Turf Photos ({inspectModal.images?.length || 0})
              </span>
              {inspectModal.images && inspectModal.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {inspectModal.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPhotoZoom(img)}
                      className="relative group rounded-xl overflow-hidden aspect-video border border-white/10 cursor-pointer bg-slate-800"
                    >
                      <img src={img} alt={`Venue photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                        <span>Click to expand</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-slate-500 text-xs text-center">
                  No photos attached to this legacy request.
                </div>
              )}
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setInspectModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800"
              >
                Close
              </button>

              {inspectModal.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectModal(inspectModal);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30"
                  >
                    Reject Application
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleApproveRequest(inspectModal._id)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    <span>Verify & Approve Venue</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Zoom Lightbox */}
      {selectedPhotoZoom && (
        <div
          onClick={() => setSelectedPhotoZoom(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img src={selectedPhotoZoom} alt="Zoomed Turf" className="w-full h-full object-contain" />
            <button
              onClick={() => setSelectedPhotoZoom(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Generated Credentials Modal */}
      {credentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
                <Key className="w-5 h-5" />
                <span>Owner Credentials Generated</span>
              </div>
              <button
                onClick={() => setCredentialsModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-xs text-slate-300">
                The partner account has been created in the database. Share these credentials with the owner:
              </p>

              <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2.5 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Login Portal</span>
                  <span className="text-emerald-400 font-bold">{window.location.origin}/login</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Email / Username</span>
                  <span className="text-white font-bold">{credentialsModal.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Generated Password</span>
                  <span className="text-amber-400 font-bold">{credentialsModal.password || credentialsModal.passwordText}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  copyToClipboard(
                    `Portal: ${window.location.origin}/login\nEmail: ${credentialsModal.email}\nPassword: ${credentialsModal.password || credentialsModal.passwordText}`
                  )
                }
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? "Copied!" : "Copy Credentials"}</span>
              </button>

              <button
                onClick={() => setCredentialsModal(null)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-lg">
                <AlertTriangle className="w-5 h-5" />
                <span>Reject Partner Request</span>
              </div>
              <button onClick={() => setRejectModal(null)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              You are rejecting the application from <strong className="text-white">{rejectModal.name}</strong> ({rejectModal.email}).
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Ground photos unverified or physical address incomplete..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 flex items-center gap-1"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
