import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["player", "owner", "admin"], default: "player", index: true },
    profileImage: { type: String, default: "" },
    phoneVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "suspended", "inactive"], default: "active" },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;