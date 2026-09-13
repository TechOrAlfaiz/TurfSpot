import mongoose from "mongoose";

const ownerRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String, default: "" },
    turfName: { type: String, default: "" },
    address: { type: String, default: "" },
    area: { type: String, default: "Jaipur" },
    city: { type: String, default: "Jaipur" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [75.7684, 26.8533], // Default Jaipur coordinates
      },
    },
    images: [{ type: String }],
    sportTypes: [{ type: String }],
    pricePerHour: { type: Number, default: 1000 },
    turfId: { type: String, ref: "Turf" },
    generatedCredentials: {
      email: { type: String },
      passwordText: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("OwnerRequest", ownerRequestSchema);