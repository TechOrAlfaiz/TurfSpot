import mongoose from "mongoose";

const turfSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true },
    description: { type: String, required: true },
    area: { type: String, default: "Mansarovar" },
    city: { type: String, default: "Jaipur" },
    address: { type: String, default: "Jaipur, Rajasthan" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    image: { type: String, required: true },
    images: [{ type: String }],
    sportTypes: [{ type: String, required: true }],
    pitchType: { type: String, default: "FIFA Synthetic Astroturf" },
    capacity: { type: String, default: "6v6 Box • 5v5 Football" },
    amenities: [{ type: String }],
    pricePerHour: { type: Number, required: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 24 },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
    lateNightAvailable: { type: Boolean, default: false },
    slotDuration: { type: Number, default: 60 }, // in minutes
    blockedSlots: [
      {
        date: { type: String },
        startTime: { type: String },
        endTime: { type: String },
        reason: { type: String, default: "Maintenance" },
      },
    ],
    isActive: { type: Boolean, default: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: false,
    },
  },
  { timestamps: true }
);

turfSchema.index({ location: "2dsphere" });

const Turf = mongoose.model("Turf", turfSchema);

export default Turf;
