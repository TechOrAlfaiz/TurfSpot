import { useState, useMemo } from "react";
import TurfCard from "./TurfCard.jsx";
import TurfCardSkeleton from "../ui/TurfCardSkeleton.jsx";
import TurfCatalogMap from "./TurfCatalogMap.jsx";
import useTurfData from "../../hooks/useTurfData.jsx";
import useUserLocation from "../../hooks/useUserLocation.jsx";
import SearchTurf from "../search/SearchTurf.jsx";
import Footer from "../layout/Footer.jsx";
import LocationSelectorModal from "../common/LocationSelectorModal.jsx";
import { JAIPUR_AREAS, JAIPUR_LOCALITY_COORDINATES, calculateClientHaversineDistance, formatDistance } from "../../data/jaipurTurfs.js";
import {
  Sparkles,
  Compass,
  MapPin,
  Moon,
  Filter,
  ArrowUpDown,
  RotateCcw,
  LayoutGrid,
  Map as MapIcon,
  Crosshair,
  SlidersHorizontal,
} from "lucide-react";

const CATALOG_PARAMS = { radius: 0 };

const Turf = () => {
  const { turfs, loading, error } = useTurfData(CATALOG_PARAMS);
  const {
    areaName: userLocality,
    lat,
    lng,
    isGPS: isGpsActive,
  } = useUserLocation();
  const userCoords = lat && lng ? [lat, lng] : null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openLocationModal = () => setIsModalOpen(true);
  const closeLocationModal = () => setIsModalOpen(false);

  // Multi-facet filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedSport, setSelectedSport] = useState("all"); // 'all' | 'Football' | 'Cricket' | 'late-night'
  const [sortBy, setSortBy] = useState("distance-asc"); // 'distance-asc' | 'default' | 'price-asc' | 'price-desc' | 'rating'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'map'

  // Filter and sort turfs
  const filteredTurfs = useMemo(() => {
    if (!Array.isArray(turfs)) return [];

    let results = turfs.filter((turf) => {
      // Sport filter
      if (selectedSport === "Football") {
        if (!turf.sportTypes?.includes("Football")) return false;
      } else if (selectedSport === "Cricket") {
        if (!turf.sportTypes?.includes("Cricket")) return false;
      } else if (selectedSport === "late-night") {
        if (
          !turf.lateNightAvailable &&
          turf.closeTime !== "01:00" &&
          turf.closeTime !== "02:00" &&
          turf.closeTime !== "23:59"
        ) {
          return false;
        }
      }

      // Area filter
      if (selectedArea !== "All Areas") {
        const areaMatch =
          turf.area === selectedArea ||
          (typeof turf.location === "string" && turf.location.includes(selectedArea)) ||
          turf.address?.includes(selectedArea);
        if (!areaMatch) return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const nameMatch = turf.name?.toLowerCase().includes(q);
        const areaMatch = turf.area?.toLowerCase().includes(q);
        const locStr =
          typeof turf.location === "string"
            ? turf.location.toLowerCase()
            : (turf.location?.address || "").toLowerCase();
        const sportMatch = Array.isArray(turf.sportTypes)
          ? turf.sportTypes.some((s) => s.toLowerCase().includes(q))
          : false;

        if (!nameMatch && !areaMatch && !locStr.includes(q) && !sportMatch) {
          return false;
        }
      }

      return true;
    });

    // Ensure distance is computed for each turf relative to active user coordinates
    const enrichedResults = results.map((turf) => {
      let d = turf.distanceKm;
      if (userCoords && (!d || d === undefined)) {
        const turfCoords = Array.isArray(turf.location?.coordinates)
          ? [turf.location.coordinates[1], turf.location.coordinates[0]]
          : turf.coordinates || [26.9124, 75.7873];
        d = calculateClientHaversineDistance(userCoords[0], userCoords[1], turfCoords[0], turfCoords[1]);
      }
      return { ...turf, calculatedDistance: d };
    });

    // Sorting
    if (sortBy === "distance-asc") {
      enrichedResults.sort((a, b) => {
        const distA = a.calculatedDistance ?? 999;
        const distB = b.calculatedDistance ?? 999;
        return distA - distB;
      });
    } else if (sortBy === "price-asc") {
      enrichedResults.sort((a, b) => (a.pricePerHour || 0) - (b.pricePerHour || 0));
    } else if (sortBy === "price-desc") {
      enrichedResults.sort((a, b) => (b.pricePerHour || 0) - (a.pricePerHour || 0));
    } else if (sortBy === "rating") {
      enrichedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return enrichedResults;
  }, [turfs, searchTerm, selectedArea, selectedSport, sortBy, userCoords]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedArea("All Areas");
    setSelectedSport("all");
    setSortBy("distance-asc");
  };

  if (error) {
    return (
      <div className="min-h-screen pt-32 text-center text-rose-400 font-bold">
        Error loading turfs: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 relative bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16 relative z-10 space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/10">
            <Compass className="w-4 h-4" />
            <span>Jaipur Sports Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Find Your Turf in <span className="text-gradient-emerald">Jaipur</span>
          </h1>

          <p className="text-slate-300/80 text-xs sm:text-sm">
            Real-time box cricket pitches & football grounds sorted by your distance across Vaishali Nagar, Mansarovar, Malviya Nagar, and beyond.
          </p>

          {/* Location Quick Indicator Pill */}
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={openLocationModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl glass-panel border border-white/15 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-md group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>Searching near: <strong className="text-emerald-300">{userLocality}</strong></span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 group-hover:bg-emerald-500/20">
                Change Area
              </span>
            </button>
          </div>
        </div>

        {/* Multi-Facet Filter Control Bar */}
        <div className="glass-panel p-5 rounded-3xl border border-white/15 shadow-2xl backdrop-blur-xl space-y-4">
          
          {/* Top Row: Search Input, View Mode Switcher, & Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-6">
              <SearchTurf onSearch={(val) => setSearchTerm(val)} />
            </div>

            {/* View Mode Toggle */}
            <div className="md:col-span-3 flex items-center justify-center">
              <div className="flex items-center p-1 rounded-2xl bg-slate-900/90 border border-white/10 w-full justify-between">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid List</span>
                </button>

                <button
                  onClick={() => setViewMode("map")}
                  className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    viewMode === "map"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map View</span>
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="md:col-span-3 flex items-center gap-2">
              <div className="relative w-full">
                <ArrowUpDown className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 text-white text-xs font-medium border border-white/10 focus:outline-none focus:border-emerald-500 appearance-none"
                >
                  <option value="distance-asc">Distance: Nearest First</option>
                  <option value="default">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Middle Row: Sport Selector Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sport:</span>
              </span>
              <button
                onClick={() => setSelectedSport("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedSport === "all"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                All Sports
              </button>
              <button
                onClick={() => setSelectedSport("Football")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSport === "Football"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>⚽ Football</span>
              </button>
              <button
                onClick={() => setSelectedSport("Cricket")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSport === "Cricket"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>🏏 Cricket</span>
              </button>
              <button
                onClick={() => setSelectedSport("late-night")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSport === "late-night"
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30"
                    : "bg-white/5 text-indigo-300 hover:text-white hover:bg-white/10 border border-indigo-500/30"
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>🌙 Late-Night (Till 2 AM)</span>
              </button>
            </div>

            {/* Reset Button */}
            {(selectedArea !== "All Areas" || selectedSport !== "all" || searchTerm || sortBy !== "distance-asc") && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Bottom Row: Jaipur Area Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Jaipur Area:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {JAIPUR_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedArea === area
                      ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold shadow-md shadow-emerald-500/20"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Displaying <strong className="text-white">{filteredTurfs.length}</strong> available sports grounds in Jaipur
          </span>
          <span className="hidden sm:inline">
            ⚡ Instant QR Slot Confirmation Guaranteed
          </span>
        </div>

        {/* View Mode Content: Grid vs Map */}
        {viewMode === "map" ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-emerald-400" />
                <span>Click on any turf pin on the map to see details and instantly reserve slots.</span>
              </div>
              <button
                onClick={() => setViewMode("grid")}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Switch to Grid
              </button>
            </div>
            <TurfCatalogMap turfs={filteredTurfs} center={userCoords} />
          </div>
        ) : (
          /* Turf Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TurfCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : filteredTurfs.length > 0 ? (
              filteredTurfs.map((turf) => (
                <TurfCard key={turf._id} turf={turf} userCoords={userCoords} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center glass-panel rounded-3xl border border-white/10 p-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 text-2xl">
                  🏟️
                </div>
                <h3 className="text-lg font-bold text-white">No Jaipur turfs found</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  No grounds matched your active filters for "{selectedArea}" and "{selectedSport}". Try resetting filters or searching another area.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="glow-btn px-6 py-2.5 rounded-xl text-xs font-bold text-white"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isModalOpen}
        onClose={closeLocationModal}
      />

      <Footer />
    </div>
  );
};

export default Turf;

