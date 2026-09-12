import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Star,
  ArrowRight,
  ShieldCheck,
  Moon,
  Users,
  CheckCircle2,
  Compass,
  Navigation,
} from "lucide-react";
import { calculateClientHaversineDistance, formatDistance } from "../../data/jaipurTurfs";

const TurfCard = ({ turf, userCoords }) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  // Compute clean area & address safely
  const areaName = turf.area || (typeof turf.location === "string" ? turf.location : "Jaipur");
  const addressLine = turf.address || (typeof turf.location === "string" ? turf.location : "Jaipur, Rajasthan");

  const bookingUrl = isLoggedIn ? `/auth/turf/${turf._id}` : `/turf/${turf._id}`;
  const price = turf.pricePerHour || 900;
  const rating = turf.rating || 4.8;
  const isLateNight = turf.lateNightAvailable || turf.closeTime === "01:00" || turf.closeTime === "02:00" || turf.closeTime === "23:59";

  const isCricket = Array.isArray(turf.sportTypes) && turf.sportTypes.includes("Cricket");
  const isFootball = Array.isArray(turf.sportTypes) && turf.sportTypes.includes("Football");

  // Distance computation: prefer pre-calculated, fallback to client-side haversine
  let distanceKm = turf.calculatedDistance ?? turf.distanceKm ?? null;
  if (distanceKm === null && userCoords) {
    const turfCoords = Array.isArray(turf.location?.coordinates)
      ? [turf.location.coordinates[1], turf.location.coordinates[0]]
      : turf.coordinates || null;
    if (turfCoords) {
      distanceKm = calculateClientHaversineDistance(userCoords[0], userCoords[1], turfCoords[0], turfCoords[1]);
    }
  }
  const distanceBadge = distanceKm !== null ? formatDistance(distanceKm) + " away" : (turf.distanceString || null);


  const quickSlots = turf.quickSlots || [
    { time: "8 PM", booked: false },
    { time: "9 PM", booked: false },
    { time: "10 PM", booked: false },
    { time: "11 PM", booked: !isLateNight },
  ];

  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group relative border border-white/10 hover:border-emerald-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10">
      {/* Image Container with Smooth Zoom & Floating Badges */}
      <div className="relative overflow-hidden h-60 w-full bg-slate-900">
        <img
          src={turf.image || "/banner-1.png"}
          alt={turf.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Soft Vignette Overlay for Crisp Typography */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges Row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* Sports Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-lg">
            {isCricket && isFootball ? (
              <span>🏏⚽ Multi-Sport</span>
            ) : isCricket ? (
              <span>🏏 Cricket</span>
            ) : isFootball ? (
              <span>⚽ Football</span>
            ) : (
              <span>⚡ Sports Turf</span>
            )}
          </div>

          {/* Distance Badge & Rating */}
          <div className="flex items-center gap-1.5">
            {distanceBadge && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 text-[11px] font-extrabold text-emerald-300 shadow-lg animate-fadeIn">
                <Navigation className="w-3 h-3 text-emerald-400" />
                <span>{distanceBadge}</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-xs font-bold text-amber-300 shadow-lg">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
            </div>
          </div>
        </div>

        {/* Bottom Title & Neighborhood Overlay on Image */}
        <div className="absolute bottom-3 left-4 right-4 space-y-1 pointer-events-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold drop-shadow">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{areaName}, Jaipur</span>
            </div>
            {isLateNight && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-900/70 border border-indigo-400/30 text-[10px] font-bold text-indigo-300">
                <Moon className="w-2.5 h-2.5 text-indigo-400" />
                <span>2 AM</span>
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors drop-shadow-md truncate">
            {turf.name}
          </h3>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Specs: Pitch Type & Playing Capacity */}
        <div className="space-y-1.5">
          <div className="text-xs text-slate-300 font-medium flex items-center justify-between">
            <span className="text-slate-400">Pitch Type:</span>
            <span className="text-white font-semibold truncate ml-2 text-right">
              {turf.pitchType || "FIFA Synthetic Astroturf"}
            </span>
          </div>
          <div className="text-xs text-slate-300 font-medium flex items-center justify-between">
            <span className="text-slate-400">Capacity:</span>
            <span className="text-emerald-300 font-semibold flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>{turf.capacity || "5v5 & 7v7"}</span>
            </span>
          </div>
        </div>

        {/* Tonight's Live Availability Strip */}
        <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Tonight's Slots:</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase">Real-Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            {quickSlots.map((slot, i) => (
              <div
                key={i}
                className={`flex-1 py-1 px-1 rounded-lg text-center text-[10px] font-bold border transition-colors ${
                  slot.booked
                    ? "bg-rose-950/40 border-rose-500/30 text-rose-300/80"
                    : "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                }`}
              >
                <span>{slot.time}</span>
                <span className="ml-1 text-[8px]">{slot.booked ? "🔴" : "🟢"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing and Action Buttons */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Starting rate</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-black text-white">₹{price}</span>
              <span className="text-[11px] text-slate-400 font-normal">/ hr</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={bookingUrl}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Details
            </Link>
            <Link
              to={bookingUrl}
              className="glow-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 group/btn"
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfCard;

