import { useEffect, useState, useCallback } from "react";
import axiosInstance from "./useAxiosInstance";
import toast from "react-hot-toast";
import { format, parseISO, isValid } from "date-fns";

export default function useBookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatBookingsData = (items) => {
    if (!Array.isArray(items)) return [];

    return items.map((booking) => {
      let formattedStartTime = "N/A";
      let formattedEndTime = "N/A";
      let formattedDate = "N/A";
      let rawDate = null;

      try {
        if (booking.timeSlot?.startTime) {
          const parsed = parseISO(booking.timeSlot.startTime);
          if (isValid(parsed)) {
            formattedStartTime = format(parsed, "hh:mm a");
            formattedDate = format(parsed, "dd MMM yyyy");
            rawDate = parsed;
          } else {
            formattedStartTime = booking.timeSlot.startTime;
          }
        }
        if (booking.timeSlot?.endTime) {
          const parsed = parseISO(booking.timeSlot.endTime);
          if (isValid(parsed)) {
            formattedEndTime = format(parsed, "hh:mm a");
          } else {
            formattedEndTime = booking.timeSlot.endTime;
          }
        }
        if (booking.timeSlot?.date) {
          formattedDate = booking.timeSlot.date;
        } else if (booking.bookingDate) {
          const parsedDate = new Date(booking.bookingDate);
          if (isValid(parsedDate)) {
            formattedDate = format(parsedDate, "dd MMM yyyy");
            if (!rawDate) rawDate = parsedDate;
          }
        }
      } catch (err) {
        console.warn("Date formatting fallback for booking:", booking._id, err);
      }

      return {
        ...booking,
        status: booking.status || "CONFIRMED",
        rawDate,
        timeSlot: {
          ...booking.timeSlot,
          formattedStartTime: formattedStartTime || booking.startTime || "N/A",
          formattedEndTime: formattedEndTime || booking.endTime || "N/A",
          date: formattedDate,
        },
      };
    });
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "/api/user/booking/get-bookings"
      );
      const result = response.data;
      const formattedBookings = formatBookingsData(result);
      setBookings(formattedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = async (bookingId, reason = "User requested cancellation") => {
    try {
      const response = await axiosInstance.delete(`/api/user/booking/${bookingId}/cancel`, {
        data: { reason }
      });
      toast.success(response.data?.message || "Booking cancelled and slot released.");
      await fetchBookings();
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Cancellation error:", error);
      const msg = error.response?.data?.message || "Failed to cancel booking";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, refetch: fetchBookings, cancelBooking };
}

