import { Router } from "express";
import {
  verifyPayment,
  createOrder,
  getBookings,
  cancelBooking,
  handleRazorpayWebhook,
  getPaymentConfig,
  cancelSlotHold,
} from "../../controllers/user/booking.controller.js";
import verifyUserToken from "../../middleware/jwt/user.middleware.js";

const bookingRouter = Router();

bookingRouter.get("/config", getPaymentConfig);
bookingRouter.post("/create-order", verifyUserToken, createOrder);
bookingRouter.post("/verify-payment", verifyUserToken, verifyPayment);
bookingRouter.post("/cancel-hold", verifyUserToken, cancelSlotHold);
bookingRouter.get("/get-bookings", verifyUserToken, getBookings);
bookingRouter.get("/my-bookings", verifyUserToken, getBookings);
bookingRouter.get("/", verifyUserToken, getBookings);
bookingRouter.post("/:id/cancel", verifyUserToken, cancelBooking);
bookingRouter.patch("/:id/cancel", verifyUserToken, cancelBooking);
bookingRouter.delete("/:id/cancel", verifyUserToken, cancelBooking);
bookingRouter.post("/webhook", handleRazorpayWebhook);

export default bookingRouter;



