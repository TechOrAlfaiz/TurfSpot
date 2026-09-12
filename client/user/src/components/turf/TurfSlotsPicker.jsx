import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import axiosInstance from "../../hooks/useAxiosInstance";
import { Calendar, Clock, CheckCircle2, XCircle, ArrowRight, AlertCircle, Ban } from "lucide-react";

/**
 * TurfSlotsPicker Component
 * Renders date picker, legend, and a grid of hourly slot chips (🟢 Available, 🔴 Booked, 🟡 Selected, ⚪ Past/Maintenance)
 */
const TurfSlotsPicker = ({ turfId, onSelectSlot }) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);

  // Fetch slots whenever selectedDate or turfId changes
  useEffect(() => {
    if (!turfId || !selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError(null);
      setActiveSlot(null);

      try {
        let response;
        try {
          response = await axiosInstance.get(
            `/api/user/turf/${turfId}/slots?date=${selectedDate}`
          );
        } catch (err) {
          response = await axiosInstance.get(
            `/api/turfs/${turfId}/slots?date=${selectedDate}`
          );
        }

        const slotData = Array.isArray(response.data)
          ? response.data
          : response.data.slots || [];
        setSlots(slotData);
      } catch (err) {
        console.error("Error fetching slots:", err);
        setError("Failed to load time slots for the selected date.");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [turfId, selectedDate]);

  const handleSlotClick = (slot) => {
    const isBooked = slot.booked || slot.isBooked || slot.status === "BOOKED";
    const isPast = slot.isPast || slot.status === "PAST" || slot.status === "MAINTENANCE";
    if (isBooked || isPast) return;
    setActiveSlot(slot);
  };

  const handleProceed = () => {
    if (activeSlot && onSelectSlot) {
      onSelectSlot({
        date: selectedDate,
        startTime: activeSlot.startTime,
        endTime: activeSlot.endTime,
      });
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
      {/* Title & Date Picker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Daily Slot Availability</h3>
            <p className="text-xs text-slate-400">Select a date to view real-time available time slots</p>
          </div>
        </div>

        {/* Date Selector Input */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-white/10 shrink-0">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <input
            type="date"
            value={selectedDate}
            min={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center gap-3 py-1 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-slate-500"></span>
          <span>Past / Maintenance</span>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loadingSlots ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 py-4">
          {[...Array(12)].map((_, idx) => (
            <div
              key={idx}
              className="h-14 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium text-center">
          {error}
        </div>
      ) : slots.length === 0 ? (
        <div className="p-6 text-center text-slate-400 text-sm font-medium">
          No slots available for the selected date.
        </div>
      ) : (
        /* Slots Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {slots.map((slot, index) => {
            const isSelected = activeSlot?.startTime === slot.startTime;
            const isBooked = slot.booked || slot.isBooked || slot.status === "BOOKED";
            const isPast = slot.isPast || slot.status === "PAST";
            const isMaintenance = slot.status === "MAINTENANCE";
            const isDisabled = isBooked || isPast || isMaintenance;

            let cardStyle = "bg-white/5 border-white/10 text-slate-200 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-300";
            let statusText = "Available";
            let StatusIcon = CheckCircle2;
            let iconColor = "text-emerald-400";

            if (isSelected) {
              cardStyle = "bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/30 scale-105 font-bold";
              statusText = "Selected";
              iconColor = "text-slate-950";
            } else if (isBooked) {
              cardStyle = "bg-rose-950/30 border-rose-500/30 text-rose-400/70 cursor-not-allowed opacity-75";
              statusText = "Booked";
              StatusIcon = XCircle;
              iconColor = "text-rose-400";
            } else if (isMaintenance) {
              cardStyle = "bg-slate-900/60 border-slate-700/50 text-slate-500 cursor-not-allowed opacity-50";
              statusText = "Maintenance";
              StatusIcon = Ban;
              iconColor = "text-slate-500";
            } else if (isPast) {
              cardStyle = "bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-50";
              statusText = "Past Slot";
              StatusIcon = AlertCircle;
              iconColor = "text-slate-500";
            }

            return (
              <button
                key={index}
                disabled={isDisabled}
                onClick={() => handleSlotClick(slot)}
                className={`py-3 px-3 rounded-2xl font-bold text-xs transition-all duration-200 flex flex-col items-center justify-center gap-1 border ${cardStyle}`}
              >
                <div className="flex items-center gap-1">
                  <StatusIcon className={`w-3.5 h-3.5 ${iconColor}`} />
                  <span>
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-90">
                  {statusText}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Slot Action Bar */}
      {activeSlot && (
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-300 text-sm font-medium">
            Selected Slot: <span className="font-bold text-amber-300">{activeSlot.startTime} to {activeSlot.endTime}</span> on <span className="font-bold text-white">{selectedDate}</span>
          </div>

          <button
            onClick={handleProceed}
            className="glow-btn px-6 py-3 rounded-2xl text-sm font-bold text-white flex items-center gap-2 tracking-wide w-full sm:w-auto justify-center"
          >
            <span>Proceed to Reservation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TurfSlotsPicker;

