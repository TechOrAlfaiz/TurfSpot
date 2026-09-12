import { useState, useMemo } from "react";
import {
  Clock,
  MapPin,
  IndianRupee,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Navigation,
  Star,
  CheckCircle2,
  XCircle,
  History,
  RotateCcw,
} from "lucide-react";
import useBookingHistory from "../../hooks/useBookingHistory";
import useWriteReview from "../../hooks/useWriteReview";
import TurfBookingHistorySkeleton from "../../components/ui/TurfBookingHistorySkeleton";
import WriteReview from "../../components/reviews/WriteReview";
import Footer from "../layout/Footer";

const TurfBookingHistory = () => {
  const { loading, bookings, cancelBooking } = useBookingHistory();
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'past' | 'cancelled'
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);

  const {
    isReviewModalOpen,
    rating,
    review,
    isSubmitting,
    openReviewModal,
    closeReviewModal,
    handleRatingChange,
    handleReviewChange,
    submitReview,
  } = useWriteReview();

  // Categorize bookings
  const categorized = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [];
    const past = [];
    const cancelled = [];

    bookings.forEach((booking) => {
      const isCancelled = booking.status === "CANCELLED";
      if (isCancelled) {
        cancelled.push(booking);
        return;
      }

      // Check if date is past
      let isPastDate = false;
      if (booking.rawDate) {
        const bDate = new Date(booking.rawDate);
        bDate.setHours(23, 59, 59, 999);
        if (bDate < today) {
          isPastDate = true;
        }
      }

      if (isPastDate || booking.status === "COMPLETED") {
        past.push(booking);
      } else {
        upcoming.push(booking);
      }
    });

    return { upcoming, past, cancelled };
  }, [bookings]);

  const activeBookings = categorized[activeTab] || [];

  const handleOpenCancelModal = (booking) => {
    setSelectedBookingForCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    setCancellingBookingId(selectedBookingForCancel._id);
    await cancelBooking(selectedBookingForCancel._id);
    setCancellingBookingId(null);
    setIsCancelModalOpen(false);
    setSelectedBookingForCancel(null);
  };

  if (loading) {
    return <TurfBookingHistorySkeleton />;
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-100 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 relative z-10 space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/10">
            <History className="w-4 h-4" />
            <span>Passes & Reservations</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            My Turf <span className="text-gradient-emerald">Bookings</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Manage your match slots, view QR entry passes, and track booking statuses across Jaipur.
          </p>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-center">
          <div className="glass-panel p-1.5 rounded-2xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "upcoming"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Upcoming ({categorized.upcoming.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("past")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "past"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Past Matches ({categorized.past.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("cancelled")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "cancelled"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-lg shadow-rose-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancelled ({categorized.cancelled.length})</span>
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {activeBookings.length === 0 ? (
          <div className="py-16 text-center glass-panel rounded-3xl border border-white/10 max-w-md mx-auto p-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 text-2xl">
              ⚽
            </div>
            <h3 className="text-lg font-bold text-white">No {activeTab} bookings found</h3>
            <p className="text-xs text-slate-400">
              {activeTab === "upcoming"
                ? "You have no upcoming match slots. Discover top turfs around Jaipur to book your next game!"
                : activeTab === "past"
                ? "No completed match history recorded yet."
                : "You don't have any cancelled bookings."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeBookings.map((booking) => {
              const turf = booking.turf || {};
              const isUpcoming = activeTab === "upcoming";
              const isCancelled = booking.status === "CANCELLED";

              // Coordinates for directions
              const lat = turf.location?.coordinates?.[1] || 26.9124;
              const lng = turf.location?.coordinates?.[0] || 75.7873;
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

              return (
                <div
                  key={booking._id}
                  className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl hover:border-emerald-500/30 transition-all space-y-5 flex flex-col justify-between"
                >
                  {/* Top Bar: Name & Status */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80">
                          Ref: #{booking._id.slice(-6).toUpperCase()}
                        </span>
                        <h3 className="text-xl font-extrabold text-white">{turf.name || "Turf Arena"}</h3>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
                          isCancelled
                            ? "bg-rose-950/40 text-rose-400 border-rose-500/30"
                            : isUpcoming
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse"
                            : "bg-slate-800/80 text-slate-300 border-white/10"
                        }`}
                      >
                        {isCancelled ? "Cancelled" : isUpcoming ? "Confirmed" : "Completed"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{turf.address || turf.location || "Jaipur, Rajasthan"}</span>
                    </p>
                  </div>

                  {/* Details & QR Code Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    <div className="sm:col-span-7 space-y-2.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-white">{booking.timeSlot.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>
                          {booking.timeSlot.formattedStartTime} - {booking.timeSlot.formattedEndTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-bold text-emerald-400 text-sm">
                          ₹ {booking.totalPrice} Paid
                        </span>
                      </div>
                    </div>

                    {/* QR Pass */}
                    <div className="sm:col-span-5 flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                      {booking.qrCode ? (
                        <img
                          src={booking.qrCode}
                          alt="Booking QR Code"
                          className="w-20 h-20 rounded-lg bg-white p-1 shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                          <QrCode className="w-8 h-8" />
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium mt-1">
                        Scan at Ground
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Directions</span>
                    </a>

                    {turf._id && (
                      <button
                        onClick={() => openReviewModal(turf._id)}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Review</span>
                      </button>
                    )}

                    {isUpcoming && !isCancelled && (
                      <button
                        onClick={() => handleOpenCancelModal(booking)}
                        disabled={cancellingBookingId === booking._id}
                        className="ml-auto px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Slot</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-rose-500/30 shadow-2xl space-y-5 bg-slate-900/95">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cancel Booking?</h3>
                <p className="text-xs text-slate-400">
                  This slot will be immediately released for other players.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300">
              <p>
                <strong>Turf:</strong> {selectedBookingForCancel.turf?.name}
              </p>
              <p>
                <strong>Date:</strong> {selectedBookingForCancel.timeSlot?.date}
              </p>
              <p>
                <strong>Time:</strong> {selectedBookingForCancel.timeSlot?.formattedStartTime} - {selectedBookingForCancel.timeSlot?.formattedEndTime}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="w-1/2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancellingBookingId !== null}
                className="w-1/2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                {cancellingBookingId ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <WriteReview
          rating={rating}
          review={review}
          isSubmitting={isSubmitting}
          onClose={closeReviewModal}
          onRatingChange={handleRatingChange}
          onReviewChange={handleReviewChange}
          onSubmit={submitReview}
        />
      )}

      <Footer />
    </div>
  );
};

export default TurfBookingHistory;

