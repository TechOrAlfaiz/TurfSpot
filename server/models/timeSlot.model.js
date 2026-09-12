import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    turf: { type: String, ref: "Turf", required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["HELD", "BOOKED", "AVAILABLE", "CANCELLED", "EXPIRED"],
      default: "BOOKED",
      index: true,
    },
    heldBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: { type: String },
    holdExpiresAt: { type: Date, index: true },
  },
  { timestamps: true }
);

// Enforce unique slot per turf at database engine level
timeSlotSchema.index({ turf: 1, startTime: 1 }, { unique: true });

export default mongoose.model("TimeSlot", timeSlotSchema);