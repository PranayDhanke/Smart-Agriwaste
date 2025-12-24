import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Clerk userId
    title: String,
    message: String,
    read: { type: Boolean, default: false },
    type: String, // order, negotiation, system
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
