import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Carousel from "../components/common/Carousel";
import Footer from "../components/layout/Footer";
import useTurfData from "../hooks/useTurfData";
import useUserLocation from "../hooks/useUserLocation";
import LocationSelectorModal from "../components/common/LocationSelectorModal";
import TurfCard from "../components/turf/TurfCard";
import TurfCardSkeleton from "../components/ui/TurfCardSkeleton";
import SportsImageMarquee from "../components/home/SportsImageMarquee";
import { JAIPUR_AREAS } from "../data/jaipurTurfs";
import { useSelector } from "react-redux";
import banner1 from "/banner-1.png";
import banner2 from "/banner-2.jpeg";
import banner3 from "/banner-3.jpeg";
import {
  Sparkles,
  Trophy,
  Users,
  ShieldCheck,
  ArrowRight,
  Zap,
  Flame,
  Activity,
  Compass,
  MapPin,
  Clock,
  Moon,
  CheckCircle2,
  Calendar,
  Search,
  ChevronRight,
  Star,
  Crosshair,
  Sliders,
  RotateCcw,
  Navigation,
} from "lucide-react";

const Home = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const {
    areaName,
    radius,
    isGPS,
    loading: geoLoading,
    requestCurrentLocation,
    setManualLocation,
    setRadius,
  } = useUserLocation();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { turfs, loading } = useTurfData();
  const slides = [banner1, banner2, banner3];

  // Quick Filters State
  const [selectedSport, setSelectedSport] = useState("all"); // 'all' | 'Football' | 'Cricket' | 'late-night'
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableNowOnly, setAvailableNowOnly] = useState(false);

  // Filtered and distance-sorted turfs for popular / showcase grid
  const filteredTurfs = useMemo(() => {
    if (!Array.isArray(turfs)) return [];
    const currentHour = new Date().getHours();

    let results = turfs.filter((turf) => {
      // Radius filtering (if radius > 0 and distance is available)
      if (radius > 0 && turf.distanceKm !== null && turf.distanceKm !== undefined) {
        if (turf.distanceKm > radius) return false;
      }

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

      // "Available Now" filter
      if (availableNowOnly) {
        const openH = parseInt(turf.openTime?.split(":")[0] || "6", 10);
        const closeH = parseInt(turf.closeTime?.split(":")[0] || "23", 10);
        const isOpenNow =
          closeH < openH
            ? currentHour >= openH || currentHour < closeH
            : currentHour >= openH && currentHour < closeH;
        if (!isOpenNow) return false;
      }

      // Area filter
      if (selectedArea !== "All Areas") {
        const areaMatch =
          turf.area === selectedArea ||
          (typeof turf.location === "string" && turf.location.includes(selectedArea)) ||
          turf.address?.includes(selectedArea);
        if (!areaMatch) return false;
      }

      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = turf.name?.toLowerCase().includes(q);
        const areaMatch = turf.area?.toLowerCase().includes(q);
        const sportMatch = turf.sportTypes?.some((s) => s.toLowerCase().includes(q));
        if (!nameMatch && !areaMatch && !sportMatch) return false;
      }

      return true;
    });

    // Default sorting: Nearest first (by distanceKm)
    results.sort((a, b) => {
      if (a.distanceKm === null || a.distanceKm === undefined) return 1;
      if (b.distanceKm === null || b.distanceKm === undefined) return -1;
      return a.distanceKm - b.distanceKm;
    });

    return results;
  }, [turfs, radius, selectedSport, selectedArea, searchQuery, availableNowOnly]);

  // Late-night exclusive turfs
  const lateNightTurfs = useMemo(() => {
    if (!Array.isArray(turfs)) return [];
    return turfs
      .filter(
        (t) =>
          t.lateNightAvailable ||
          t.closeTime === "01:00" ||
          t.closeTime === "02:00" ||
          t.closeTime === "23:59"
      )
      .slice(0, 3);
  }, [turfs]);

  // Cricket exclusive turfs
  const cricketTurfs = useMemo(() => {
    if (!Array.isArray(turfs)) return [];
    return turfs.filter((t) => t.sportTypes?.includes("Cricket")).slice(0, 3);
  }, [turfs]);

  return (
    <div className="min-h-screen text-slate-100 font-sans relative overflow-hidden bg-transparent">
      
      {/* 2. HERO SECTION WITH LOCATION DISCOVERY */}
      <section className="pt-8 sm:pt-16 pb-16 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Location Trigger & Search Bar */}
          <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
            
            {/* Jaipur Location Live Pill Tag */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase shadow-lg shadow-emerald-500/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="text-white hover:text-emerald-300 flex items-center gap-1 font-extrabold"
              >
                <span>📍 {areaName ? `${areaName}, Jaipur` : "Jaipur, Rajasthan"}</span>
                <span className="text-[10px] text-emerald-400 underline ml-1">Change</span>
              </button>
              <span className="text-slate-400">•</span>
              <span>10+ Verified Arenas</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight leading-[1.08]">
                Find Your Game. <br />
                <span className="text-gradient-emerald drop-shadow-sm">
                  Book Nearby Turfs.
                </span>
              </h1>
            </div>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-slate-300/90 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Discover, compare, and instantly book FIFA-grade football pitches and box cricket arenas near you in Jaipur. Real-time slot availability, instant QR access.
            </p>

            {/* Interactive GPS + Search Bar */}
            <div className="glass-panel p-2.5 rounded-2xl border border-white/15 max-w-xl mx-auto lg:mx-0 shadow-2xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search area, turf name, or sport (e.g. Mansarovar, Cricket)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/60 text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 border border-transparent"
                  />
                </div>
                <Link
                  to={isLoggedIn ? "/auth/turfs" : "/turfs"}
                  className="glow-btn px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shrink-0"
                >
                  Find Turf
                </Link>
              </div>

              {/* Location Quick GPS Button & Radius Preview */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 px-1 text-xs">
                <button
                  onClick={requestCurrentLocation}
                  disabled={geoLoading}
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${geoLoading ? "animate-spin" : ""}`} />
                  <span>{geoLoading ? "Detecting GPS..." : "Use My Current Location"}</span>
                </button>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-slate-400 hover:text-white font-medium flex items-center gap-1"
                >
                  <span>Radius: <strong className="text-white">{radius === 0 ? "All Jaipur" : `${radius} km`}</strong></span>
                  <span className="text-emerald-400 text-[11px] underline">Change</span>
                </button>
              </div>
            </div>

            {/* Prominent CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
              <Link
                to={isLoggedIn ? "/auth/turfs" : "/signup"}
                className="glow-btn px-7 py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white flex items-center gap-3 tracking-wide group shadow-lg shadow-emerald-500/25"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white group-hover:scale-110 transition-transform" />
                <span>Book a Turf</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to={isLoggedIn ? "/auth/turfs" : "/turfs"}
                className="glow-btn-secondary px-7 py-3.5 rounded-2xl text-sm sm:text-base font-semibold text-slate-200 hover:text-white flex items-center gap-2.5 group"
              >
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:rotate-45 transition-transform duration-300" />
                <span>Explore Jaipur Turfs</span>
              </Link>
            </div>

            {/* Key Jaipur Highlights Grid */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-white/10 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <span className="text-2xl sm:text-3xl font-black text-white block">10+</span>
                <span className="text-xs text-slate-400 font-medium">Jaipur Areas</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">⚽ & 🏏</span>
                <span className="text-xs text-slate-400 font-medium">Dual Sports</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="text-2xl sm:text-3xl font-black text-cyan-400 block">2 AM</span>
                <span className="text-xs text-slate-400 font-medium">Late-Night Games</span>
              </div>
            </div>
          </div>

          {/* Right Column: Tactical Match Pitch Frame */}
          <div className="lg:col-span-6 relative">
            <div className="glass-panel p-3.5 rounded-3xl border border-white/15 shadow-2xl relative overflow-hidden group">
              {/* Tactical Pitch Header Strip */}
              <div className="px-4 py-2.5 mb-3 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-white tracking-wider uppercase">Jaipur Premier Grounds</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-semibold">
                  <span>⚡ 500-Lux Lights</span>
                </div>
              </div>

              {/* Carousel Viewport */}
              <div className="rounded-2xl overflow-hidden shadow-inner relative">
                <Carousel slides={slides} />
              </div>
              
              {/* Floating Match-Ready Glass Card */}
              <div className="mt-3 p-3.5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Mansarovar • Vaishali • Malviya Nagar</h4>
                    <p className="text-xs text-slate-400">Instant WhatsApp QR pass & zero check-in delays</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="hidden sm:inline">Active</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3 & 4. QUICK SPORT SWITCHER & SEARCH FILTER SECTION */}
      <section className="py-6 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="glass-panel p-5 rounded-3xl border border-white/15 shadow-2xl backdrop-blur-xl space-y-4">
          
          {/* Top Row: Sport Selector Pills & Available Now Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                Sport:
              </span>
              <button
                onClick={() => setSelectedSport("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedSport === "all"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                All Sports
              </button>
              <button
                onClick={() => setSelectedSport("Football")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSport === "Football"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>⚽ Football</span>
              </button>
              <button
                onClick={() => setSelectedSport("Cricket")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSport === "Cricket"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>🏏 Cricket</span>
              </button>
              <button
                onClick={() => setSelectedSport("late-night")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedSport === "late-night"
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30"
                    : "bg-white/5 text-indigo-300 hover:text-white hover:bg-white/10 border border-indigo-500/30"
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>🌙 Late Night</span>
              </button>
              <button
                onClick={() => setAvailableNowOnly(!availableNowOnly)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  availableNowOnly
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md font-extrabold"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border-white/10"
                }`}
              >
                <span>🟢 Available Now</span>
              </button>
            </div>

            {/* Radius & Location Status */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Radius: {radius === 0 ? "All Jaipur" : `${radius} km`}</span>
              </button>
              <span className="text-xs text-slate-400 font-semibold">
                Found <strong className="text-emerald-400">{filteredTurfs.length}</strong> turfs
              </span>
            </div>
          </div>

          {/* Bottom Row: Jaipur Area Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
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
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-md"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 5. TURFS NEAR YOU SECTION (SORTED BY DISTANCE) */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold tracking-wider uppercase mb-2">
              <Navigation className="w-4 h-4" />
              <span>Location-Aware Discovery</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Turfs Near <span className="text-gradient-emerald">{areaName || "Jaipur"}</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-lg">
              Sorted by closest driving distance from your current location with real-time tonight slots.
            </p>
          </div>

          <Link
            to={isLoggedIn ? "/auth/turfs" : "/turfs"}
            className="glow-btn-secondary px-5 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:text-white flex items-center gap-2 self-start md:self-auto group"
          >
            <span>View All {turfs.length} Turfs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Turf Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <TurfCardSkeleton key={`skeleton-${index}`} />
              ))
            : filteredTurfs.length > 0
            ? filteredTurfs
                .slice(0, 6)
                .map((turf) => <TurfCard key={turf._id} turf={turf} />)
            : (
              <div className="col-span-full py-16 text-center glass-panel rounded-3xl border border-white/10 p-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 text-2xl">
                  📍
                </div>
                <h3 className="text-lg font-bold text-white">No turfs found within {radius} km of {areaName}</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Try expanding your search radius to see turfs across other Jaipur neighborhoods.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setRadius(25)}
                    className="glow-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white"
                  >
                    Expand Radius to 25 km
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSport("all");
                      setSelectedArea("All Areas");
                      setSearchQuery("");
                      setAvailableNowOnly(false);
                      setRadius(0);
                    }}
                    className="glow-btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300"
                  >
                    Show All Jaipur Turfs
                  </button>
                </div>
              </div>
            )}
        </div>
      </section>

      {/* 6. CONTINUOUSLY SCROLLING SPORTS IMAGE MARQUEE */}
      <SportsImageMarquee />

      {/* 7. PLAY AFTER DARK 🌙 — LATE-NIGHT PLAY FEATURE */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="rounded-3xl p-6 sm:p-10 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950 border border-indigo-500/30 shadow-2xl">
          {/* Ambient Night Lights */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Night Owl Sports Feature</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Play After Dark <span className="text-indigo-400">🌙</span>
              </h2>
              <p className="text-slate-300/80 text-sm max-w-xl mt-1">
                Beat the Jaipur daytime heat. Discover floodlit turfs operating with slots from <strong>8:00 PM to 2:00 AM</strong>.
              </p>
            </div>

            {/* Popular Late Night Slots Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {["08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM", "12:00 AM", "01:00 AM"].map((slot) => (
                <span
                  key={slot}
                  className="px-2.5 py-1 rounded-lg bg-indigo-900/40 border border-indigo-400/30 text-xs font-mono text-indigo-200"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>

          {/* Late Night Turfs Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lateNightTurfs.map((turf) => (
              <TurfCard key={turf._id} turf={turf} />
            ))}
          </div>

          {/* Bottom Banner Bar */}
          <div className="relative z-10 mt-8 pt-6 border-t border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-xs sm:text-sm text-slate-300 font-medium">
                High-lux stadium lighting guaranteed across all late-night verified Jaipur grounds.
              </span>
            </div>
            <Link
              to={isLoggedIn ? "/auth/turfs" : "/turfs"}
              className="glow-btn px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2"
            >
              <span>Book Tonight's Slot</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. CRICKET UNDER THE LIGHTS 🏏 */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>🏏 Dedicated Cricket Grounds</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Cricket Under <span className="text-gradient-emerald">The Lights 🏏</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Professional box cricket pitches with pro bowling machines, perimeter nets, and high-visibility yellow balls.
            </p>
          </div>

          <Link
            to={isLoggedIn ? "/auth/turfs" : "/turfs"}
            className="glow-btn-secondary px-5 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:text-white flex items-center gap-2"
          >
            <span>Explore All Cricket Turfs</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cricket Turfs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {cricketTurfs.map((turf) => (
            <TurfCard key={turf._id} turf={turf} />
          ))}
        </div>
      </section>

      {/* 9. WHY CHOOSE US */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Built For Athletes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Why Jaipur Teams Choose <span className="text-gradient-emerald">TurfSpot</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Everything you need for a frictionless, tournament-grade playing experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 hover:border-emerald-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time Slot Lock</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant slot reservation with zero risk of double booking or phone tag with venue managers.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 hover:border-emerald-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Verified Turf Quality</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All pitches inspected for 40-50mm monofilament turf grass, non-abrasive infill, and safe fencing.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 hover:border-emerald-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Moon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Late-Night Lighting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-lux shadowless LED floodlights designed specifically for night cricket balls and high-speed football.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 hover:border-emerald-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Digital QR Check-in</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Show your mobile QR pass at the entrance gate and step directly onto the pitch with your squad.
            </p>
          </div>
        </div>
      </section>

      {/* 10. HOW IT WORKS */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-3xl font-extrabold text-white">
              How It Works in <span className="text-gradient-emerald">3 Simple Steps</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              From discovering a pitch in Jaipur to kick-off in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl font-black text-emerald-400">
                1
              </div>
              <h3 className="text-base font-bold text-white">Choose Your Turf</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Filter by neighborhood (Mansarovar, Vaishali, Malviya Nagar) and preferred sport (⚽ or 🏏).
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl font-black text-cyan-400">
                2
              </div>
              <h3 className="text-base font-bold text-white">Pick Your Slot</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Select from prime daytime hours or late-night slots (up to 2:00 AM) with live price quotes.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xl font-black text-indigo-400">
                3
              </div>
              <h3 className="text-base font-bold text-white">Book & Play</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Receive instant confirmation, split payments with teammates, and show your QR pass at gate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. JAIPUR PLAYER TESTIMONIALS */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-emerald-400" />
            <span>Community Voice</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Loved By <span className="text-gradient-emerald">Jaipur Players</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              "We play midnight box cricket every Friday in Mansarovar. TurfSpot made finding open 11 PM slots completely effortless. Best turf platform in Jaipur!"
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                AK
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Aman Khandelwal</h4>
                <p className="text-[11px] text-slate-400">Mansarovar Box Strikers</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              "The floodlights at Vaishali Super Turf Club are unmatched. Booking on TurfSpot took 30 seconds and the QR entry was instantaneous."
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                VS
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Vikramaditya Shekhawat</h4>
                <p className="text-[11px] text-slate-400">Jaipur Futsal Club</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              "Finding quality cricket practice nets with bowling machines in Malviya Nagar used to be difficult. TurfSpot solved this completely for our league."
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                RT
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Rohit Tiwari</h4>
                <p className="text-[11px] text-slate-400">Pink City Cricket XI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FINAL CALL TO ACTION */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="rounded-3xl p-8 sm:p-14 text-center glass-panel border border-emerald-500/30 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Own The Pitch in <br />
              <span className="text-gradient-emerald">Jaipur Tonight?</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Gather your squad, select your favorite venue across 10+ Jaipur areas, and secure your time slot right now.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to={isLoggedIn ? "/auth/turfs" : "/signup"}
                className="glow-btn px-8 py-4 rounded-2xl text-base font-bold text-white flex items-center gap-3 tracking-wide"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>Book Your Turf Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={isLoggedIn ? "/auth/turfs" : "/turfs"}
                className="glow-btn-secondary px-8 py-4 rounded-2xl text-base font-semibold text-slate-200 hover:text-white"
              >
                Explore All Grounds
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 13. FOOTER */}
      <Footer />

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};

export default Home;

