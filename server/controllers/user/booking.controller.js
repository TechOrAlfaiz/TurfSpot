import adjustTime from "../../utils/adjustTime.js";
import crypto from "crypto";
import mongoose from "mongoose";
import Booking from "../../models/booking.model.js";
import TimeSlot from "../../models/timeSlot.model.js";
import generateQRCode from "../../utils/generateQRCode.js";
import Turf from "../../models/turf.model.js";
import generateEmail, { generateHTMLContent } from "../../utils/generateEmail.js";
import sendWhatsAppBookingConfirmation from "../../utils/whatsapp.js";
import User from "../../models/user.model.js";
import Payment from "../../models/payment.model.js";
import paymentProvider from "../../services/payment/index.js";
import { format, parseISO } from "date-fns";

const PAYMENT_HOLD_MINUTES = 10;

/**
 * Helper to clean up any expired slot holds
 */
export const cleanupExpiredHolds = async () => {
  try {
    const now = new Date();
    await TimeSlot.deleteMany({
      status: "HELD",
      holdExpiresAt: { $lt: now },
    });
  } catch (err) {
    console.warn("[SlotHoldCleanup] Notice:", err.message);
  }
};

/**
 * 0. Get Public Payment Provider Configuration
 * GET /api/user/booking/config
 */
export const getPaymentConfig = async (req, res) => {
  const providerInfo = paymentProvider.getProviderInfo();
  return res.status(200).json({
    success: true,
    provider: providerInfo.provider,
    isTestMode: providerInfo.isTestMode,
    razorpayKeyId:
      providerInfo.provider === "razorpay" ? process.env.RAZORPAY_KEY_ID || "" : null,
  });
};

/**
 * 1. Create Payment Order with Server-Calculated Price & Slot Hold
 * POST /api/user/booking/create-order
 */
export const createOrder = async (req, res) => {
  const userId = req.user?.user || req.user?.id;
  const {
    id: turfId,
    duration = 1,
    startTime,
    endTime,
    selectedTurfDate,
    sport = "Cricket",
  } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: User session required" });
  }

  try {
    // 1. Clean up any expired holds first
    await cleanupExpiredHolds();

    let user = null;
    if (mongoose.isValidObjectId(userId)) {
      user = await User.findById(userId).select("name email phone");
    }
    if (!user) {
      user = { _id: userId, name: "Player", email: "player@turfspot.com", phone: "9829012345" };
    }

    const turf = mongoose.isValidObjectId(turfId)
      ? await Turf.findById(turfId)
      : await Turf.findOne({ $or: [{ _id: turfId }, { name: turfId }] });
    if (!turf) {
      return res.status(404).json({ success: false, message: "Turf not found" });
    }

    const pricePerHour = Number(turf.pricePerHour) || 900;
    const safeDuration = Math.max(1, Number(duration) || 1);
    const serverCalculatedPrice = pricePerHour * safeDuration;

    // Calculate dates & times
    const adjustedStartTime = startTime
      ? adjustTime(startTime, selectedTurfDate || new Date().toISOString())
      : new Date();
    const adjustedEndTime = endTime
      ? adjustTime(endTime, selectedTurfDate || new Date().toISOString())
      : new Date(Date.now() + safeDuration * 3600000);

    // 2. ATOMIC DOUBLE BOOKING / SLOT HOLD CHECK
    let existingSlot = await TimeSlot.findOne({
      turf: String(turf._id),
      startTime: adjustedStartTime,
    });

    if (existingSlot) {
      // If held by someone else and not expired
      if (
        existingSlot.status === "HELD" &&
        existingSlot.holdExpiresAt &&
        existingSlot.holdExpiresAt > new Date() &&
        String(existingSlot.heldBy) !== String(userId)
      ) {
        return res.status(409).json({
          success: false,
          code: "SLOT_CURRENTLY_HELD",
          message: "This slot is currently being reserved by another player. Please try another slot or check back in a few minutes.",
        });
      }

      // If already booked
      if (existingSlot.status === "BOOKED") {
        return res.status(409).json({
          success: false,
          code: "SLOT_ALREADY_BOOKED",
          message: "Sorry, this slot is already booked. Please choose another time slot.",
        });
      }

      // If hold expired or held by same user, remove the old hold
      await TimeSlot.findByIdAndDelete(existingSlot._id);
    }

    // 3. Create a temporary slot hold for this order
    const holdExpiresAt = new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60 * 1000);
    let heldSlot = null;
    try {
      heldSlot = await TimeSlot.create({
        turf: String(turf._id),
        startTime: adjustedStartTime,
        endTime: adjustedEndTime,
        status: "HELD",
        heldBy: userId,
        holdExpiresAt,
      });
    } catch (createErr) {
      if (createErr.code === 11000) {
        return res.status(409).json({
          success: false,
          code: "SLOT_ALREADY_BOOKED",
          message: "This slot was just selected by another player. Please pick another slot.",
        });
      }
      throw createErr;
    }

    // 4. Create Order via configured PaymentProvider (Mock or Razorpay)
    const order = await paymentProvider.createOrder({
      amount: serverCalculatedPrice * 100, // in paise
      currency: "INR",
      receipt: `rcpt_${Date.now().toString(36)}`,
      notes: {
        turfId: String(turf._id),
        turfName: turf.name,
        userId: String(user._id),
        sport,
        slotId: String(heldSlot._id),
      },
    });

    // Update slot with orderId
    await TimeSlot.findByIdAndUpdate(heldSlot._id, { orderId: order.id });

    // Track payment attempt in database
    await Payment.findOneAndUpdate(
      { orderId: order.id },
      {
        orderId: order.id,
        provider: paymentProvider.getProviderInfo().provider,
        amount: serverCalculatedPrice,
        currency: "INR",
        status: "PENDING",
        userId: user._id,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      order,
      providerInfo: paymentProvider.getProviderInfo(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      serverCalculatedPrice,
      slotHold: {
        expiresAt: holdExpiresAt,
        holdMinutes: PAYMENT_HOLD_MINUTES,
      },
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Verify Payment & Finalize Booking
 * POST /api/user/booking/verify-payment
 */
export const verifyPayment = async (req, res) => {
  const userId = req.user?.user || req.user?.id;

  const {
    id: turfId,
    duration = 1,
    startTime,
    endTime,
    selectedTurfDate,
    sport = "Cricket",
    paymentId,
    orderId,
    razorpay_signature,
    status = "SUCCESS",
  } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: User session required" });
  }

  if (!turfId || !startTime) {
    return res.status(400).json({ success: false, message: "Turf ID and start time are required" });
  }

  const adjustedStartTime = startTime
    ? adjustTime(startTime, selectedTurfDate || new Date().toISOString())
    : new Date();
  const adjustedEndTime = endTime
    ? adjustTime(endTime, selectedTurfDate || new Date().toISOString())
    : new Date(Date.now() + 3600000);

  try {
    // 0. Idempotency check: if booking already confirmed for this order, return existing booking
    if (orderId) {
      const existingBooking = await Booking.findOne({ "payment.orderId": orderId })
        .populate("timeSlot", "startTime endTime status")
        .populate("turf", "name location area address image pricePerHour sportTypes");
      if (existingBooking) {
        return res.status(200).json({
          success: true,
          message: "Booking is already confirmed.",
          booking: existingBooking,
          bookingReference: existingBooking.bookingReference,
          isSimulated: existingBooking.payment?.isSimulated || false,
        });
      }
    }

    // 1. Verify payment with active provider
    const verification = await paymentProvider.verifyPayment({
      orderId,
      paymentId,
      signature: razorpay_signature,
      status,
    });

    // 2. Handle Payment Failure simulation or rejection
    if (!verification.verified || verification.status === "FAILED") {
      // Release slot hold immediately so it becomes available again
      await TimeSlot.findOneAndDelete({
        turf: String(turfId),
        startTime: adjustedStartTime,
        status: "HELD",
      });

      // Update payment record to FAILED
      if (orderId) {
        await Payment.findOneAndUpdate(
          { orderId },
          {
            status: "FAILED",
            failureReason: verification.message || "Payment verification failed",
            paymentId,
          }
        );
      }

      return res.status(400).json({
        success: false,
        status: "PAYMENT_FAILED",
        message: verification.message || "Payment verification failed or was declined. Slot has been released.",
      });
    }

    const formattedStartTime = startTime ? format(parseISO(startTime), "hh:mm a") : "06:00 AM";
    const formattedEndTime = endTime ? format(parseISO(endTime), "hh:mm a") : "07:00 AM";
    const formattedDate = selectedTurfDate
      ? format(parseISO(selectedTurfDate), "d MMM yyyy")
      : format(new Date(), "d MMM yyyy");

    // 3. Fetch User and Turf safely
    const [user, turf] = await Promise.all([
      mongoose.isValidObjectId(userId) ? User.findById(userId) : null,
      mongoose.isValidObjectId(turfId)
        ? Turf.findById(turfId)
        : Turf.findOne({ $or: [{ _id: turfId }, { name: turfId }] }),
    ]);

    if (!turf) {
      return res.status(404).json({ success: false, message: "Turf not found" });
    }

    const activeUser = user || { _id: userId, name: "Player", email: "player@turfspot.com", phone: "9829012345" };
    const safeDuration = Math.max(1, Number(duration) || 1);
    const finalPrice = (turf.pricePerHour || 900) * safeDuration;

    // 4. Atomically transition slot from HELD to BOOKED
    let timeSlotDoc = await TimeSlot.findOneAndUpdate(
      {
        turf: String(turf._id),
        startTime: adjustedStartTime,
      },
      {
        status: "BOOKED",
        heldBy: null,
        holdExpiresAt: null,
      },
      { new: true }
    );

    if (!timeSlotDoc) {
      try {
        timeSlotDoc = await TimeSlot.create({
          turf: String(turf._id),
          startTime: adjustedStartTime,
          endTime: adjustedEndTime,
          status: "BOOKED",
        });
      } catch (slotErr) {
        if (slotErr.code === 11000) {
          return res.status(409).json({
            success: false,
            message: "Slot was already confirmed by another booking.",
            code: "SLOT_ALREADY_BOOKED",
          });
        }
        throw slotErr;
      }
    }

    // 5. Generate QR Code & Reference
    const isMock = verification.provider === "mock";
    const bookingRef = `TS-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const qrCode = await generateQRCode(
      finalPrice,
      formattedStartTime,
      formattedEndTime,
      formattedDate,
      turf.name,
      turf.location
    );

    // 6. Create Confirmed Booking in MongoDB
    const newBooking = await Booking.create({
      user: activeUser._id,
      turf: String(turf._id),
      timeSlot: timeSlotDoc._id,
      sport: sport || "Cricket",
      bookingReference: bookingRef,
      status: "CONFIRMED",
      duration: safeDuration,
      bookingDate: formattedDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      totalPrice: finalPrice,
      qrCode,
      payment: {
        orderId: orderId || `ord_${Date.now()}`,
        paymentId: paymentId || `pay_${Date.now()}`,
        signature: razorpay_signature || "",
        status: "SUCCESS",
        provider: verification.provider || "mock",
        isSimulated: isMock,
      },
    });

    if (user && Array.isArray(user.bookings)) {
      user.bookings.push(newBooking._id);
      await user.save();
    }

    // 7. Update Payment transaction status to SUCCESS
    if (orderId) {
      await Payment.findOneAndUpdate(
        { orderId },
        {
          status: "SUCCESS",
          paymentId: paymentId || `pay_${Date.now()}`,
          signature: razorpay_signature || "",
          bookingId: newBooking._id,
        }
      );
    }

    // 8. Dispatch Notifications (WhatsApp & Email) in background
    (async () => {
      // WhatsApp notification
      try {
        const waResult = await sendWhatsAppBookingConfirmation({
          recipientPhone: activeUser.phone,
          userName: activeUser.name,
          turfName: turf.name,
          sport: sport || "Cricket",
          bookingDate: formattedDate,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          duration: safeDuration,
          totalPrice: finalPrice,
          bookingReference: bookingRef,
          address: turf.address || turf.area,
          coordinates: turf.location?.coordinates,
        });

        if (waResult?.status) {
          await Booking.findByIdAndUpdate(newBooking._id, {
            "notificationStatus.whatsapp": waResult.status,
          });
        }
      } catch (waErr) {
        console.warn("[Notification] WhatsApp notice:", waErr.message);
      }

      // Email notification
      try {
        const htmlContent = generateHTMLContent(
          turf.name,
          turf.address || turf.area,
          formattedDate,
          formattedStartTime,
          formattedEndTime,
          finalPrice,
          qrCode,
          bookingRef,
          sport
        );

        const emailResult = await generateEmail(
          activeUser.email,
          `Booking Confirmed (${bookingRef}) - ${turf.name}`,
          htmlContent
        );

        if (emailResult?.status) {
          await Booking.findByIdAndUpdate(newBooking._id, {
            "notificationStatus.email": emailResult.status,
          });
        }
      } catch (emailErr) {
        console.warn("[Notification] Email notice:", emailErr.message);
      }
    })();

    return res.status(200).json({
      success: true,
      message: isMock
        ? "Test Booking confirmed successfully! (Development Mode: Simulated Payment)"
        : "Booking confirmed successfully! Your match is locked in.",
      isSimulated: isMock,
      booking: newBooking,
      bookingReference: bookingRef,
    });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while confirming your reservation",
      error: error.message,
    });
  }
};

/**
 * 3. Cancel Slot Hold (when user closes or abandons payment)
 * POST /api/user/booking/cancel-hold
 */
export const cancelSlotHold = async (req, res) => {
  const userId = req.user?.user || req.user?.id;
  const { turfId, startTime, selectedTurfDate, orderId } = req.body;

  try {
    const adjustedStartTime = startTime
      ? adjustTime(startTime, selectedTurfDate || new Date().toISOString())
      : null;

    if (adjustedStartTime && turfId) {
      await TimeSlot.findOneAndDelete({
        turf: String(turfId),
        startTime: adjustedStartTime,
        status: "HELD",
      });
    }

    if (orderId) {
      await TimeSlot.findOneAndDelete({ orderId, status: "HELD" });
      await Payment.findOneAndUpdate(
        { orderId },
        { status: "FAILED", failureReason: "Slot hold cancelled by user" }
      );
    }

    return res.status(200).json({ success: true, message: "Slot hold released." });
  } catch (err) {
    console.error("Error in cancelSlotHold:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


/**
 * 4. Cancel Booking with Slot Release and Automatic Refund Processing
 * POST /api/user/booking/cancel/:id
 */
export const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const { reason = "Player requested cancellation" } = req.body;
  const userId = req.user?.user || req.user?.id;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (String(booking.user) !== String(userId) && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: You cannot cancel another player's booking" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "This booking is already cancelled" });
    }

    booking.status = "CANCELLED";
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();

    // Process refund via configured payment provider
    if (booking.payment?.paymentId) {
      try {
        const refundResponse = await paymentProvider.refundPayment({
          paymentId: booking.payment.paymentId,
          amount: booking.totalPrice,
          reason: booking.cancellationReason,
          bookingId: String(booking._id),
        });

        booking.refund = {
          refundId: refundResponse.refundId,
          status: refundResponse.status,
          amount: refundResponse.amount,
          refundedAt: refundResponse.refundedAt || new Date(),
        };
        booking.payment.status = "REFUNDED";
      } catch (refundErr) {
        console.warn("[Refund Notice]:", refundErr.message);
      }
    }

    await booking.save();

    // Update Payment transaction record if exists
    if (booking.payment?.orderId) {
      await Payment.findOneAndUpdate(
        { orderId: booking.payment.orderId },
        {
          status: "REFUNDED",
          refundDetails: {
            refundId: booking.refund?.refundId || `rfnd_${Date.now()}`,
            amount: booking.totalPrice,
            reason: booking.cancellationReason,
            refundedAt: new Date(),
          },
        }
      );
    }

    // Release TimeSlot immediately so slot becomes available
    if (booking.timeSlot) {
      await TimeSlot.findByIdAndDelete(booking.timeSlot);
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully. Slot has been released and refund initiated.",
      booking,
    });
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Webhooks Listener
 * POST /api/user/booking/webhook
 */
export const handleRazorpayWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  try {
    const eventResult = await paymentProvider.handleWebhook(req.body, signature);
    const { event, payload } = eventResult;

    if (event === "payment.captured") {
      const paymentEntity = payload?.payment?.entity;
      if (paymentEntity?.order_id) {
        await Promise.all([
          Booking.findOneAndUpdate(
            { "payment.orderId": paymentEntity.order_id },
            { "payment.status": "SUCCESS", "payment.paymentId": paymentEntity.id }
          ),
          Payment.findOneAndUpdate(
            { orderId: paymentEntity.order_id },
            { status: "SUCCESS", paymentId: paymentEntity.id }
          ),
        ]);
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload?.payment?.entity;
      if (paymentEntity?.order_id) {
        await Promise.all([
          Booking.findOneAndUpdate(
            { "payment.orderId": paymentEntity.order_id },
            { "payment.status": "FAILED", status: "PAYMENT_FAILED" }
          ),
          Payment.findOneAndUpdate(
            { orderId: paymentEntity.order_id },
            { status: "FAILED", failureReason: paymentEntity.error_description || "Payment failed" }
          ),
          TimeSlot.findOneAndDelete({ orderId: paymentEntity.order_id, status: "HELD" }),
        ]);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Error handling webhook:", err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};


/**
 * 6. Get Real Booking History for Authenticated User
 * GET /api/user/booking/
 */
export const getBookings = async (req, res) => {
  const userId = req.user?.user || req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: User session required" });
  }

  try {
    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("timeSlot", "startTime endTime status")
      .populate("turf", "name location area address image pricePerHour sportTypes");

    const enrichedBookings = bookings.map((b) => {
      const obj = b.toObject();
      if (!obj.timeSlot && obj.startTime) {
        obj.timeSlot = {
          date: obj.bookingDate,
          formattedStartTime: obj.startTime,
          formattedEndTime: obj.endTime,
        };
      } else if (obj.timeSlot?.startTime) {
        obj.timeSlot.date = format(new Date(obj.timeSlot.startTime), "d MMM yyyy");
        obj.timeSlot.formattedStartTime = format(new Date(obj.timeSlot.startTime), "hh:mm a");
        obj.timeSlot.formattedEndTime = format(new Date(obj.timeSlot.endTime), "hh:mm a");
      }
      return obj;
    });

    return res.status(200).json(enrichedBookings);
  } catch (error) {
    console.error("Error in getBookings:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
