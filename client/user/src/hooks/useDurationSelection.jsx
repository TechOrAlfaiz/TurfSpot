import { addHours, isAfter, isBefore, isEqual, addDays } from "date-fns";
import { parseTimeStr, formatTimeDisplay } from "../utils/dateUtils";

const useDurationSelection = (
  selectedStartTime,
  timeSlots,
  isTimeSlotBooked,
  setDuration
) => {
  const handleDurationChange = (newDuration) => {
    setDuration(newDuration);
  };

  const isDurationAvailable = (startTime, hours) => {
    if (!startTime || !hours) return false;

    const start = parseTimeStr(startTime);
    if (!start) return false;

    const end = addHours(start, hours);

    // If timeSlots has closeTime, validate against it
    if (timeSlots && timeSlots.closeTime) {
      let closeTime = parseTimeStr(timeSlots.closeTime);
      if (closeTime) {
        if (isBefore(closeTime, start) || isEqual(closeTime, start)) {
          closeTime = addDays(closeTime, 1);
        }
        if (isAfter(end, closeTime)) return false;
      }
    }

    // Check if any intermediate 1-hour slot is booked
    if (typeof isTimeSlotBooked === "function") {
      for (let i = 0; i < hours; i++) {
        const checkTime = addHours(start, i);
        const checkTimeFormatted = formatTimeDisplay(checkTime);
        if (isTimeSlotBooked(checkTimeFormatted)) {
          return false;
        }
      }
    }

    return true;
  };

  return {
    handleDurationChange,
    isDurationAvailable,
  };
};

export default useDurationSelection;

