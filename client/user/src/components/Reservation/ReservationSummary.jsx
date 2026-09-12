import { formatSafeDate, getEndTime } from "../../utils/dateUtils";
import { Calendar, Clock, Timer, IndianRupee, Tag, ShieldCheck } from "lucide-react";

const ReservationSummary = ({
  selectedDate,
  selectedStartTime,
  duration = 1,
  pricePerHour = 900,
}) => {
  const safeDuration = Number(duration) || 1;
  const safePrice = Number(pricePerHour) || 900;
  const basePrice = safePrice * safeDuration;
  const platformFee = 0; // promo period
  const gst = 0; // 0% promo
  const grandTotal = basePrice + platformFee + gst;

  return (
    <div className="p-5 rounded-2xl bg-slate-950/50 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2 pb-3 border-b border-white/10">
        <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white">Booking Summary</h3>
          <p className="text-[10px] text-slate-400">Review your reservation details</p>
        </div>
      </div>

      {/* Detail Rows */}
      <div className="space-y-2.5 text-xs text-slate-300">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Date
          </span>
          <span className="font-bold text-white">
            {formatSafeDate(selectedDate, "dd MMM yyyy", "Selected Date")}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            Time Slot
          </span>
          <span className="font-bold text-white">
            {selectedStartTime} → {getEndTime(selectedStartTime, safeDuration)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Timer className="w-3.5 h-3.5 text-cyan-400" />
            Duration
          </span>
          <span className="font-bold text-white">
            {safeDuration} hour{safeDuration > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5">
            <IndianRupee className="w-3 h-3 text-emerald-400" />
            Base Price ({safeDuration}hr × ₹{safePrice})
          </span>
          <span className="font-semibold text-white">₹{basePrice}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-emerald-400" />
            Platform Fee
          </span>
          <span className="font-semibold text-emerald-400">₹0 (Free!)</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3 h-3" />
            GST
          </span>
          <span className="font-semibold">₹{gst}</span>
        </div>

        {/* Grand Total */}
        <div className="flex items-center justify-between pt-3 border-t border-emerald-500/30">
          <span className="text-sm font-extrabold text-white">Grand Total</span>
          <span className="text-lg font-black text-emerald-400">₹{grandTotal}</span>
        </div>
      </div>
    </div>
  );
};

export default ReservationSummary;


