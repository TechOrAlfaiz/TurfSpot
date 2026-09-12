import mongoose from "mongoose";

/**
 * Payment Transaction Model
 * Records every payment attempt, order creation, verification, and refund.
 */
const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, index: true },
    provider: {
      type: String,
      enum: ["mock", "razorpay"],
      required: true,
      default: "mock",
    },
    amount: { type: Number, required: true }, // in INR
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["CREATED", "PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", index: true },
    signature: { type: String },
    failureReason: { type: String },
    rawResponse: { type: mongoose.Schema.Types.Mixed },
    refundDetails: {
      refundId: { type: String },
      amount: { type: Number },
      reason: { type: String },
      refundedAt: { type: Date },
    },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);
