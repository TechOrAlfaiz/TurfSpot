import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    turf: { type: String, ref: "Turf", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

reviewSchema.index({ turf: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);