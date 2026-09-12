import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, isSameDay } from "date-fns";
import { formatSafeDate, parseSafeDate } from "../../utils/dateUtils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const DateSelection = ({ selectedDate, handleDateChange }) => {
  const safeDate = parseSafeDate(selectedDate) || new Date();

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Select Date</h3>
          <p className="text-[10px] text-slate-400">Choose the day for your match</p>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-3 justify-center">
        <button
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => handleDateChange(addDays(safeDate, -1))}
          disabled={isSameDay(safeDate, new Date())}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="relative flex-1 max-w-xs">
          <DatePicker
            selected={safeDate}
            onChange={handleDateChange}
            dateFormat="dd-MM-yyyy"
            minDate={new Date()}
            className="w-full text-center py-3 px-4 rounded-2xl bg-slate-900/80 border border-white/15 text-white text-sm font-bold focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          />
          <div className="text-center mt-1.5">
            <span className="text-xs font-semibold text-emerald-400">
              {formatSafeDate(safeDate, "EEEE, dd MMM yyyy", "Select Date")}
            </span>
          </div>
        </div>

        <button
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
          onClick={() => handleDateChange(addDays(safeDate, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DateSelection;


