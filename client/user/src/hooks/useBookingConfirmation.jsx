import { useState } from "react";
import { addHours, formatISO } from "date-fns";
import toast from "react-hot-toast";
import axiosInstance from "./useAxiosInstance";
import { handlePayment } from "../config/razorpay";
import { parseSafeDate, formatSafeDate, parseTimeStr } from "../utils/dateUtils";
import { useNavigate } from "react-router-dom";

const useBookingConfirmation = (
  id,
  selectedDate,
  selectedStartTime,
  duration = 1,
  pricePerHour = 900,
  setLoading
) => {
  const navigate = useNavigate();
  const [mockModalOpen, setMockModalOpen] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const confirmReservation = async () => {
    if (!id) {
      toast.error("Invalid turf selected.");
      return;
    }

    if (!selectedStartTime) {
      toast.error("Please select a start time for your reservation.");
      return;
    }

    const safeDate = parseSafeDate(selectedDate) || new Date();
    const selectedTurfDate = formatSafeDate(safeDate, "yyyy-MM-dd");

    const parsedStartTime = parseTimeStr(selectedStartTime, safeDate);
    if (!parsedStartTime) {
      toast.error("Invalid start time selected.");
      return;
    }

    const safeDuration = Number(duration) || 1;
    const combinedStartDateTime = new Date(safeDate);
    combinedStartDateTime.setHours(
      parsedStartTime.getHours(),
      parsedStartTime.getMinutes(),
      0,
      0
    );

    const combinedEndDateTime = addHours(combinedStartDateTime, safeDuration);

    const startTimeISO = formatISO(combinedStartDateTime);
    const endTimeISO = formatISO(combinedEndDateTime);

    try {
      setLoading(true);

      // 1. Create Order & Temporary Slot Hold on Backend
      const createOrderRes = await axiosInstance.post("/api/user/booking/create-order", {
        id,
        duration: safeDuration,
        startTime: startTimeISO,
        endTime: endTimeISO,
        selectedTurfDate,
      });

      const orderData = createOrderRes.data;
      const provider = orderData.providerInfo?.provider || (orderData.order?.isTestMode ? "mock" : "razorpay");

      const pendingData = {
        id,
        duration: safeDuration,
        startTime: startTimeISO,
        endTime: endTimeISO,
        selectedTurfDate,
        startTimeFormatted: selectedStartTime,
        endTimeFormatted: formatSafeDate(combinedEndDateTime, "hh:mm a"),
        turfName: orderData.order?.notes?.turfName || "Turf Arena",
        amount: orderData.serverCalculatedPrice || (pricePerHour * safeDuration),
        orderId: orderData.order?.id,
        user: orderData.user,
        order: orderData.order,
      };

      setLoading(false);

      // 2. Branch according to Payment Provider mode
      if (provider === "mock" || orderData.providerInfo?.isTestMode) {
        // Open Mock Payment Simulator Modal
        setMockOrderDetails(pendingData);
        setMockModalOpen(true);
      } else {
        // Launch Production Razorpay Checkout
        const razorpayKey =
          orderData.providerInfo?.razorpayKeyId ||
          import.meta.env.VITE_RAZORPAY_KEY_ID;

        const razorpayResponse = await handlePayment(orderData.order, orderData.user, razorpayKey);
        setLoading(true);

        const verifyRes = await axiosInstance.post("/api/user/booking/verify-payment", {
          id,
          duration: safeDuration,
          startTime: startTimeISO,
          endTime: endTimeISO,
          selectedTurfDate,
          paymentId: razorpayResponse.razorpay_payment_id,
          orderId: razorpayResponse.razorpay_order_id || orderData.order?.id,
          razorpay_signature: razorpayResponse.razorpay_signature,
        });

        toast.success(verifyRes.data.message || "Booking confirmed!");
        navigate("/auth/booking-history");
      }
    } catch (err) {
      setLoading(false);
      const errorMsg =
        err.response?.data?.message ||
        err.customMessage ||
        "Booking could not be initiated. Please try another slot.";
      toast.error(errorMsg);
    }
  };

  // Handler for simulating successful payment in mock mode
  const handleSimulateSuccess = async () => {
    if (!mockOrderDetails) return;

    try {
      setIsProcessingPayment(true);

      const verifyRes = await axiosInstance.post("/api/user/booking/verify-payment", {
        id: mockOrderDetails.id,
        duration: mockOrderDetails.duration,
        startTime: mockOrderDetails.startTime,
        endTime: mockOrderDetails.endTime,
        selectedTurfDate: mockOrderDetails.selectedTurfDate,
        paymentId: `mock_pay_${Date.now()}`,
        orderId: mockOrderDetails.orderId,
        razorpay_signature: `mock_sig_${Date.now()}`,
        status: "SUCCESS",
      });

      setMockModalOpen(false);
      toast.success(verifyRes.data.message || "Test Booking Confirmed (Simulated) 🎉");
      navigate("/auth/booking-history");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Simulated payment verification failed.";
      toast.error(errorMsg);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handler for simulating failed payment in mock mode
  const handleSimulateFailure = async () => {
    if (!mockOrderDetails) return;

    try {
      setIsProcessingPayment(true);

      await axiosInstance.post("/api/user/booking/verify-payment", {
        id: mockOrderDetails.id,
        duration: mockOrderDetails.duration,
        startTime: mockOrderDetails.startTime,
        endTime: mockOrderDetails.endTime,
        selectedTurfDate: mockOrderDetails.selectedTurfDate,
        paymentId: `mock_fail_${Date.now()}`,
        orderId: mockOrderDetails.orderId,
        status: "FAILED",
      });
    } catch (err) {
      // Expected 400 rejection from server
      const msg = err.response?.data?.message || "Simulated Payment Failed. Slot released.";
      toast.error(msg);
    } finally {
      setIsProcessingPayment(false);
      setMockModalOpen(false);
    }
  };

  // Handler for canceling / dismissing mock payment modal
  const handleCloseMockModal = async () => {
    if (mockOrderDetails) {
      try {
        await axiosInstance.post("/api/user/booking/cancel-hold", {
          turfId: mockOrderDetails.id,
          startTime: mockOrderDetails.startTime,
          selectedTurfDate: mockOrderDetails.selectedTurfDate,
        });
      } catch (err) {
        console.warn("Cancel hold notice:", err.message);
      }
    }
    setMockModalOpen(false);
  };

  return {
    confirmReservation,
    mockModalOpen,
    mockOrderDetails,
    isProcessingPayment,
    handleSimulateSuccess,
    handleSimulateFailure,
    handleCloseMockModal,
  };
};

export default useBookingConfirmation;
