import { useEffect, useMemo, useState } from "react";
import {
  format,
  isBefore,
  isAfter,
  addHours,
  addDays,
} from "date-fns";
import axiosInstance from "./useAxiosInstance";
import {
  parseSafeDate,
  formatSafeDate,
  parseTimeStr,
  formatTimeDisplay,
  isSameTime,
} from "../utils/dateUtils";

const useTimeSelection = (
  selectedDate,
  turfId,
  setSelectedStartTime,
  setBookedTime,
  setTimeSlots,
  setPricePerHour,
  bookedTime = [],
  timeSlots = { openTime: "06:00", closeTime: "23:00" },
  setDuration
) => {
  const [loadingSlots, setLoadingSlots] = useState(false);

  const availableTimes = useMemo(() => {
    const openStr = timeSlots?.openTime || "06:00";
    const closeStr = timeSlots?.closeTime || "23:00";

    const openTime = parseTimeStr(openStr);
    const closeTime = parseTimeStr(closeStr);

    if (!openTime || !closeTime) {
      return [];
    }

    const openH = openTime.getHours();
    const closeH = closeTime.getHours();
    const effectiveCloseH = closeH <= openH ? closeH + 24 : closeH;

    const times = [];
    const base = new Date();
    base.setMinutes(0, 0, 0);

    for (let h = openH; h < effectiveCloseH; h++) {
      const slotTime = new Date(base);
      slotTime.setHours(h % 24, 0, 0, 0);
      times.push(format(slotTime, "hh:mm a"));
    }

    return times;
  }, [timeSlots?.openTime, timeSlots?.closeTime]);

  const handleTimeSelection = (time) => {
    setSelectedStartTime(time);
    if (typeof setDuration === "function") {
      setDuration(1);
    }
  };

  const isTimeSlotBooked = (time) => {
    const timeToCheck = parseTimeStr(time);
    if (!timeToCheck) return false;

    // 1. Check if time has already passed for today
    const now = new Date();
    const safeSelectedDate = parseSafeDate(selectedDate) || now;
    const isToday = format(now, "yyyy-MM-dd") === format(safeSelectedDate, "yyyy-MM-dd");
    if (isToday) {
      const slotDateTime = new Date(safeSelectedDate);
      slotDateTime.setHours(timeToCheck.getHours(), timeToCheck.getMinutes(), 0, 0);
      if (slotDateTime <= now) {
        return true;
      }
    }

    // 2. Check if manually blocked/maintenance on turf
    if (Array.isArray(timeSlots?.blockedSlots)) {
      const dateStr = format(safeSelectedDate, "yyyy-MM-dd");
      const isBlocked = timeSlots.blockedSlots.some(
        (b) => b.date === dateStr && b.startTime === time
      );
      if (isBlocked) return true;
    }

    // 3. Check against MongoDB active booked & held slots
    if (Array.isArray(bookedTime) && bookedTime.length > 0) {
      return bookedTime.some((booking) => {
        const bookingStart = parseTimeStr(booking.startTime || booking.formattedStartTime);
        let bookingEnd = parseTimeStr(booking.endTime || booking.formattedEndTime);
        if (!bookingStart || !bookingEnd) return false;

        if (isBefore(bookingEnd, bookingStart)) {
          bookingEnd = addDays(bookingEnd, 1);
        }

        return (
          (isAfter(timeToCheck, bookingStart) ||
            isSameTime(timeToCheck, bookingStart)) &&
          isBefore(timeToCheck, bookingEnd)
        );
      });
    }

    return false;
  };


  const fetchByDate = async (currentSelectedDate, currentTurfId) => {
    if (!currentTurfId) return;
    const safeDate = parseSafeDate(currentSelectedDate) || new Date();
    const dateStr = format(safeDate, "yyyy-MM-dd");

    setLoadingSlots(true);
    try {
      const response = await axiosInstance.get(
        `/api/user/turf/timeSlot?date=${dateStr}&turfId=${currentTurfId}`
      );
      const result = response.data;
      if (result?.timeSlots) {
        setTimeSlots(result.timeSlots);
        if (result.timeSlots.pricePerHour) {
          setPricePerHour(result.timeSlots.pricePerHour);
        }
      }

      if (Array.isArray(result?.bookedTime)) {
        const formattedBookedTime = result.bookedTime.map((booking) => {
          const s = parseSafeDate(booking.startTime);
          const e = parseSafeDate(booking.endTime);
          return {
            ...booking,
            startTime: s ? format(s, "hh:mm a") : booking.startTime,
            endTime: e ? format(e, "hh:mm a") : booking.endTime,
          };
        });
        setBookedTime(formattedBookedTime);
      } else {
        setBookedTime([]);
      }
    } catch (error) {
      console.warn("TimeSlot query fallback:", error.message);
      // Fallback to getting turf details to populate openTime, closeTime, pricePerHour
      try {
        const turfRes = await axiosInstance.get(`/api/user/turf/${currentTurfId}`);
        const turfData = turfRes.data?.turf;
        if (turfData) {
          setTimeSlots({
            openTime: turfData.openTime || "06:00",
            closeTime: turfData.closeTime || "23:00",
            pricePerHour: turfData.pricePerHour || 900,
          });
          setPricePerHour(turfData.pricePerHour || 900);
        }
      } catch (fallbackErr) {
        console.warn("Turf details fallback error:", fallbackErr.message);
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchByDate(selectedDate, turfId);
  }, [selectedDate, turfId]);

  return {
    availableTimes,
    handleTimeSelection,
    isTimeSlotBooked,
    loadingSlots,
  };
};

export default useTimeSelection;

