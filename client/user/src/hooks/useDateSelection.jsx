import { parseSafeDate } from "../utils/dateUtils";

const useDateSelection = (
  setSelectedDate,
  setSelectedStartTime,
  setDuration
) => {
  const handleDateChange = (date) => {
    const valid = parseSafeDate(date);
    if (valid) {
      setSelectedDate(valid);
      setSelectedStartTime(null);
      if (typeof setDuration === "function") {
        setDuration(1);
      }
    }
  };

  return {
    handleDateChange,
  };
};

export default useDateSelection;

