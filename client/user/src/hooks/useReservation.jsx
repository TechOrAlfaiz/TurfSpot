import { useParams, useSearchParams } from "react-router-dom";
import useDateSelection from "./useDateSelection";
import useTimeSelection from "./useTimeSelection";
import useDurationSelection from "./useDurationSelection";
import useBookingConfirmation from "./useBookingConfirmation";
import { parseSafeDate } from "../utils/dateUtils";
import { useState } from "react";

const useReservation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const queryDate = searchParams.get("date");
  const queryStartTime = searchParams.get("startTime");

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    return parseSafeDate(queryDate) || new Date();
  });
  const [selectedStartTime, setSelectedStartTime] = useState(
    queryStartTime ? queryStartTime : null
  );
  const [bookedTime, setBookedTime] = useState([]);
  const [timeSlots, setTimeSlots] = useState({ openTime: "06:00", closeTime: "23:00" });
  const [pricePerHour, setPricePerHour] = useState(900);
  const [duration, setDuration] = useState(1);

  const { handleDateChange } = useDateSelection(
    setSelectedDate,
    setSelectedStartTime,
    setDuration
  );

  const { availableTimes, handleTimeSelection, isTimeSlotBooked, loadingSlots } =
    useTimeSelection(
      selectedDate,
      id,
      setSelectedStartTime,
      setBookedTime,
      setTimeSlots,
      setPricePerHour,
      bookedTime,
      timeSlots,
      setDuration
    );

  const { handleDurationChange, isDurationAvailable } = useDurationSelection(
    selectedStartTime,
    timeSlots,
    isTimeSlotBooked,
    setDuration
  );

  const {
    confirmReservation,
    mockModalOpen,
    mockOrderDetails,
    isProcessingPayment,
    handleSimulateSuccess,
    handleSimulateFailure,
    handleCloseMockModal,
  } = useBookingConfirmation(
    id,
    selectedDate,
    selectedStartTime,
    duration,
    pricePerHour,
    setLoading
  );

  return {
    selectedDate,
    selectedStartTime,
    duration,
    availableTimes,
    timeSlots,
    handleDateChange,
    handleTimeSelection,
    handleDurationChange,
    isTimeSlotBooked,
    isDurationAvailable,
    confirmReservation,
    pricePerHour,
    loading: loading || loadingSlots,
    mockModalOpen,
    mockOrderDetails,
    isProcessingPayment,
    handleSimulateSuccess,
    handleSimulateFailure,
    handleCloseMockModal,
  };
};

export default useReservation;


