import DateSelection from "./DateSelection";
import TimeSelection from "./TimeSelection";
import DurationSelection from "./DurationSelection";
import ReservationSummary from "./ReservationSummary";
import MockPaymentModal from "./MockPaymentModal";
import useReservation from "../../hooks/useReservation";
import ReservationSkeleton from "../ui/ReservationSkeleton";
import Footer from "../layout/Footer";
import { ShieldCheck, ArrowRight, Zap } from "lucide-react";

const Reservation = () => {
  const {
    selectedDate,
    selectedStartTime,
    duration,
    availableTimes,
    timeSlots,
    pricePerHour,
    handleDateChange,
    handleTimeSelection,
    handleDurationChange,
    isTimeSlotBooked,
    isDurationAvailable,
    confirmReservation,
    loading,
    mockModalOpen,
    mockOrderDetails,
    isProcessingPayment,
    handleSimulateSuccess,
    handleSimulateFailure,
    handleCloseMockModal,
  } = useReservation();


  if (loading) return <ReservationSkeleton />;

  const isDisabled =
    !selectedStartTime ||
    !isDurationAvailable(selectedStartTime, duration) ||
    loading;

  return (
    <div className="min-h-screen bg-transparent text-slate-100 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-20 relative z-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/10">
            <Zap className="w-4 h-4" />
            <span>Instant Reservation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Reserve Your <span className="text-gradient-emerald">Slot</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Pick your preferred date, time, and duration to lock in your match.
          </p>
        </div>

        {/* Reservation Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-8">
          
          {/* Date Section */}
          <DateSelection
            selectedDate={selectedDate}
            handleDateChange={handleDateChange}
          />

          {/* Time Section */}
          <TimeSelection
            availableTimes={availableTimes}
            selectedStartTime={selectedStartTime}
            handleTimeSelection={handleTimeSelection}
            isTimeSlotBooked={isTimeSlotBooked}
            timeSlots={timeSlots}
            duration={duration}
          />

          {/* Duration Section */}
          {selectedStartTime && (
            <DurationSelection
              selectedStartTime={selectedStartTime}
              duration={duration}
              handleDurationChange={handleDurationChange}
              isDurationAvailable={isDurationAvailable}
            />
          )}

          {/* Summary Section */}
          {selectedStartTime && duration > 0 && (
            <ReservationSummary
              selectedDate={selectedDate}
              selectedStartTime={selectedStartTime}
              duration={duration}
              pricePerHour={pricePerHour}
            />
          )}

          {/* Confirm Button */}
          <div className="pt-4 border-t border-white/10">
            <button
              className={`w-full py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3 tracking-wide transition-all ${
                isDisabled
                  ? "bg-slate-700/50 cursor-not-allowed opacity-60"
                  : "glow-btn"
              }`}
              disabled={isDisabled}
              onClick={confirmReservation}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Processing...</span>
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Confirm & Lock Slot</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-500 mt-2 font-medium">
              ⚡ Instant QR confirmation · No hidden charges · Slot locked within seconds
            </p>
          </div>
        </div>
      </div>

      {/* Development Mock Payment Modal */}
      <MockPaymentModal
        isOpen={mockModalOpen}
        onClose={handleCloseMockModal}
        orderData={mockOrderDetails}
        onSimulateSuccess={handleSimulateSuccess}
        onSimulateFailure={handleSimulateFailure}
        isProcessing={isProcessingPayment}
      />

      <Footer />
    </div>
  );
};

export default Reservation;


