import { getEndTime } from "../../utils/dateUtils";
import { Timer, Clock } from "lucide-react";

const DurationSelection = ({
  selectedStartTime,
  duration,
  handleDurationChange,
  isDurationAvailable,
}) => {
  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
          <Timer className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Select Duration</h3>
          <p className="text-[10px] text-slate-400">How long do you want to play?</p>
        </div>
      </div>

      {/* Duration Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((hours) => {
          const isSelected = duration === hours;
          const isDisabled = !isDurationAvailable(selectedStartTime, hours);

          return (
            <button
              key={hours}
              className={`p-4 rounded-2xl text-center transition-all duration-200 border flex flex-col items-center gap-2 ${
                isSelected
                  ? "bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/20 scale-[1.02]"
                  : isDisabled
                  ? "bg-white/3 border-white/5 text-slate-500 cursor-not-allowed opacity-40"
                  : "bg-white/5 border-white/10 text-slate-200 hover:bg-emerald-500/10 hover:border-emerald-500/30"
              }`}
              onClick={() => handleDurationChange(hours)}
              disabled={isDisabled}
            >
              <span className={`text-2xl font-black ${isSelected ? "text-emerald-400" : "text-white"}`}>
                {hours}
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? "text-emerald-300" : "text-slate-400"}`}>
                hour{hours > 1 ? "s" : ""}
              </span>
              <span className={`text-[10px] font-medium flex items-center gap-1 ${isSelected ? "text-emerald-400/80" : "text-slate-500"}`}>
                <Clock className="w-2.5 h-2.5" />
                {selectedStartTime} → {getEndTime(selectedStartTime, hours)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DurationSelection;

