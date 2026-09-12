import { addHours } from "date-fns";
import { parseTimeStr } from "../../utils/dateUtils";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

const TimeSelection = ({
  availableTimes = [],
  selectedStartTime,
  handleTimeSelection,
  isTimeSlotBooked,
  timeSlots,
  duration = 1,
}) => {
  const isTimeSlotSelected = (time) => {
    if (!selectedStartTime || !duration) return false;
    const start = parseTimeStr(selectedStartTime);
    const current = parseTimeStr(time);
    if (!start || !current) return false;
    const end = addHours(start, duration);
    return current >= start && current < end;
  };

  const isTimeSlotDisabled = (time) => {
    if (typeof isTimeSlotBooked === "function") {
      return isTimeSlotBooked(time);
    }
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Select Start Time</h3>
          <p className="text-[10px] text-slate-400">Pick when your match begins</p>
        </div>
      </div>

      {/* Empty State / Time Grid */}
      {availableTimes.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center text-slate-400 text-xs">
          Loading available time slots for this date...
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {availableTimes.map((time) => {
            const isSelected = isTimeSlotSelected(time);
            const isDisabled = isTimeSlotDisabled(time);

            return (
              <button
                key={time}
                type="button"
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/30 scale-105"
                    : isDisabled
                    ? "bg-rose-950/30 border-rose-500/20 text-rose-400/50 cursor-not-allowed opacity-60"
                    : "bg-white/5 border-white/10 text-slate-200 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-300"
                }`}
                onClick={() => !isDisabled && handleTimeSelection(time)}
                disabled={isDisabled}
              >
                {isDisabled ? (
                  <XCircle className="w-3 h-3 text-rose-400/50" />
                ) : isSelected ? (
                  <CheckCircle2 className="w-3 h-3 text-slate-950" />
                ) : null}
                <span>{time}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimeSelection;


