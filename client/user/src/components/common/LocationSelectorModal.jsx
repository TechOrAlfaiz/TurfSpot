import { useState } from "react";
import {
  MapPin,
  Crosshair,
  Search,
  X,
  Compass,
  AlertCircle,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { JAIPUR_AREAS } from "../../data/jaipurTurfs";
import useUserLocation from "../../hooks/useUserLocation";

const RADIUS_OPTIONS = [
  { label: "5 km", value: 5 },
  { label: "10 km (Default)", value: 10 },
  { label: "15 km", value: 15 },
  { label: "25 km", value: 25 },
  { label: "All Jaipur", value: 0 },
];

const LocationSelectorModal = ({ isOpen, onClose }) => {
  const {
    areaName,
    radius,
    isGPS,
    loading,
    error,
    requestCurrentLocation,
    setManualLocation,
    setRadius,
  } = useUserLocation();

  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const selectableAreas = JAIPUR_AREAS.filter((a) => a !== "All Areas");
  const filteredAreas = selectableAreas.filter((a) =>
    a.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleUseGPS = async () => {
    const res = await requestCurrentLocation();
    if (res.success) {
      onClose();
    }
  };

  const handleSelectArea = (area) => {
    setManualLocation(area);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-emerald-500/30 p-6 sm:p-8 shadow-2xl shadow-emerald-500/15 relative overflow-hidden space-y-6">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Select Location</h3>
              <p className="text-xs text-slate-400">Find turfs closest to you in Jaipur</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Location Button */}
        <div className="relative z-10 space-y-2">
          <button
            onClick={handleUseGPS}
            disabled={loading}
            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${
              isGPS
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10"
                : "bg-white/5 border-white/10 text-white hover:border-emerald-500/40 hover:bg-emerald-500/10"
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Crosshair className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </div>
              <div>
                <span className="text-sm font-bold block text-white group-hover:text-emerald-300">
                  {loading ? "Detecting GPS coordinates..." : "Use My Current Location"}
                </span>
                <span className="text-xs text-slate-400">
                  {isGPS ? `Active: ${areaName} (GPS)` : "High accuracy GPS detection"}
                </span>
              </div>
            </div>
            {isGPS && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Locality Search Input */}
        <div className="relative z-10 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Or Search Jaipur Locality:
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Mansarovar, Vaishali Nagar, Malviya Nagar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/15 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        {/* Popular Areas Grid */}
        <div className="relative z-10 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Popular Neighborhoods:
          </label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {filteredAreas.map((area) => {
              const isSelected = !isGPS && areaName === area;
              return (
                <button
                  key={area}
                  onClick={() => handleSelectArea(area)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-bold"
                      : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-emerald-500/30"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{area}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Radius Selector */}
        <div className="relative z-10 pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Search Radius:</span>
            </span>
            <span className="font-semibold text-emerald-300">
              {radius === 0 ? "Unlimited (All Jaipur)" : `Within ${radius} km`}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRadius(opt.value)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  radius === opt.value
                    ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-md"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {opt.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LocationSelectorModal;
