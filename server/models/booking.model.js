import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    turf: { type: String, ref: "Turf", required: true, index: true },
    timeSlot: { type: mongoose.Schema.Types.ObjectId, ref: "TimeSlot" },
    sport: { type: String, default: "Cricket" },
    bookingReference: {
      type: String,
      unique: true,
      index: true,
      default: () => `TS-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED", "COMPLETED", "PENDING", "PAYMENT_FAILED"],
      default: "CONFIRMED",
      index: true,
    },
    totalPrice: { type: Number, required: true },
    qrCode: { type: String, required: true },
    duration: { type: Number, default: 1 },
    bookingDate: { type: String, index: true },
    startTime: { type: String },
    endTime: { type: String },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    payment: {
      orderId: { type: String, required: true, index: true },
      paymentId: { type: String, required: true },
      signature: { type: String },
      status: { type: String, enum: ["SUCCESS", "FAILED", "REFUNDED", "PENDING"], default: "SUCCESS" },
    },
    refund: {
      refundId: { type: String },
      status: { type: String },
      amount: { type: Number },
      refundedAt: { type: Date },
    },
    notificationStatus: {
      whatsapp: {
        type: String,
        enum: ["SENT", "FAILED", "NOT_CONFIGURED", "PENDING"],
        default: "PENDING",
      },
      email: {
        type: String,
        enum: ["SENT", "FAILED", "NOT_CONFIGURED", "PENDING"],
        default: "PENDING",
      },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ turf: 1, bookingDate: 1 });

export default mongoose.model("Booking", bookingSchema);


