import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useTurfData from "../../hooks/useTurfData";
import useReviews from "../../hooks/useReviews";
import useUserLocation from "../../hooks/useUserLocation";
import Reviews from "../reviews/Reviews";
import TurfDetailsSkeleton from "../ui/TurfDetailsSkeleton";
import Footer from "../layout/Footer";
import TurfMap from "./TurfMap";
import TurfSlotsPicker from "./TurfSlotsPicker";
import {
  MapPin,
  Clock,
  Activity,
  IndianRupee,
  Star,
  ShieldCheck,
  ArrowRight,
  Navigation,
  CheckCircle,
  Users,
  Compass,
} from "lucide-react";
import { calculateClientHaversineDistance, formatDistance, JAIPUR_TURFS } from "../../data/jaipurTurfs";

const TurfDetails = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, turfs } = useTurfData();
  const { averageRating } = useReviews(id);
  const { coords: userCoords } = useUserLocation();

  const [selectedImage, setSelectedImage] = useState(null);

  if (loading) {
    return <TurfDetailsSkeleton />;
  }

  const turf = turfs.find((t) => t._id === id) || JAIPUR_TURFS.find((t) => t._id === id);

  if (!turf) {
    return (
      <div className="min-h-screen bg-transparent pt-32 px-4 text-center">
        <div className="max-w-md mx-auto glass-panel p-8 rounded-3xl border border-amber-500/30 text-amber-300 font-bold space-y-4">
          <p className="text-xl">Turf Ground Not Found</p>
          <button onClick={() => navigate("/turfs")} className="glow-btn px-6 py-2.5 rounded-xl text-sm text-white">
            Return to Turfs
          </button>
        </div>
      </div>
    );
  }

  const currentMainImage = selectedImage || turf.image || "/banner-1.png";
  const galleryImages =
    turf.images && turf.images.length > 0
      ? turf.images
      : [currentMainImage];

  // Calculate distance
  const turfCoords = Array.isArray(turf.location?.coordinates)
    ? [turf.location.coordinates[1], turf.location.coordinates[0]] // [lat, lng]
    : turf.coordinates || [26.9124, 75.7873];

  const distanceKm = userCoords && turfCoords
    ? calculateClientHaversineDistance(userCoords[0], userCoords[1], turfCoords[0], turfCoords[1])
    : turf.distanceKm || null;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${turfCoords[0]},${turfCoords[1]}`;

  const handleReservation = (slotData) => {
    if (isLoggedIn) {
      if (slotData && slotData.date && slotData.startTime) {
        navigate(`/auth/reserve/${id}?date=${slotData.date}&startTime=${slotData.startTime}`);
      } else {
        navigate(`/auth/reserve/${id}`);
      }
    } else {
      navigate(`/login`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 relative z-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Glass Frame Image */}
          <div className="lg:col-span-6 glass-panel p-3 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="relative h-[440px] rounded-2xl overflow-hidden">
              <img
                src={currentMainImage}
                alt={turf.name}
                className="w-full h-full object-cover transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/banner-1.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent"></div>
              
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-xs font-bold text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Arena</span>
                </div>
                {distanceKm !== null && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-500/40 text-xs font-bold text-blue-300">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{formatDistance(distanceKm)}</span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white">{turf.name}</h1>
                <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {turf.address || (typeof turf.location === "string" ? turf.location : "Jaipur, Rajasthan")}
                  </span>
                </div>
              </div>
            </div>

            {/* Multi-Photo Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2.5 mt-3 px-1 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-16 w-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      currentMainImage === img
                        ? "border-emerald-400 scale-105 shadow-lg shadow-emerald-500/30"
                        : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${turf.name} angle ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/banner-1.png";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Glass Information Box */}
          <div className="lg:col-span-6 glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-7">
            {/* Rating & Action Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-bold text-white">
                  {averageRating ? averageRating.toFixed(1) : (turf.rating || 4.8).toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 5.0 Rating</span>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-2 transition-all shadow-md shadow-emerald-500/10"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </a>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">{turf.description}</p>

            {/* Grid Attributes */}
            <div className="grid grid-cols-2 gap-3.5">
              <InfoItem
                icon={<IndianRupee className="w-5 h-5 text-emerald-400" />}
                label="Price per Hour"
                value={`₹ ${turf.pricePerHour}`}
              />
              <InfoItem
                icon={<Activity className="w-5 h-5 text-teal-400" />}
                label="Sports Available"
                value={Array.isArray(turf.sportTypes) ? turf.sportTypes.join(", ") : turf.sportTypes}
              />
              <InfoItem
                icon={<Clock className="w-5 h-5 text-cyan-400" />}
                label="Operating Hours"
                value={`${turf.openTime || "06:00"} - ${turf.closeTime || "23:00"}`}
              />
              <InfoItem
                icon={<Users className="w-5 h-5 text-indigo-400" />}
                label="Pitch / Capacity"
                value={`${turf.pitchType || "FIFA Turf"} (${turf.capacity || "5v5 / 6v6"})`}
              />
            </div>

            {/* Amenities Pills */}
            {turf.amenities && turf.amenities.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Venue Amenities:
                </span>
                <div className="flex flex-wrap gap-2">
                  {turf.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action */}
            <button
              className="glow-btn w-full py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3 tracking-wide"
              onClick={() => handleReservation()}
            >
              <span>Reserve Instant Slot</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Map & Routing Section */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-xl">
          <TurfMap turf={turf} />
        </div>

        {/* Slot Availability Grid Section */}
        <TurfSlotsPicker turfId={id} onSelectSlot={handleReservation} />

        {/* Reviews */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-xl">
          <Reviews turfId={id} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="text-sm font-bold text-white truncate">{value}</p>
    </div>
  </div>
);

export default TurfDetails;

