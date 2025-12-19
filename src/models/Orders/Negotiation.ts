import { Negotiation } from "@/components/types/orders";
import mongoose, { Schema } from "mongoose";

const NegotiationSchema = new Schema<Negotiation>(
  {
    buyerId: { type: String, required: true },
    buyerName: { type: String, required: true },
    farmerId: { type: String, required: true },
    item: {
      prodId: { type: String, required: true },
      title: { type: String, required: true },
      wasteType: { type: String, required: true },
      wasteProduct: { type: String, required: true },
      moisture: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      unit: { type: String, required: true },
      description: { type: String, required: true },
      image: { type: String, required: true },
      sellerInfo: {
        seller: {
          farmerId: { type: String, required: true },
          farmerName: { type: String, required: true },
        },
        address: {
          houseBuildingName: { type: String, required: true },
          roadarealandmarkName: { type: String, required: true },
          state: { type: String, required: true },
          district: { type: String, required: true },
          taluka: { type: String, required: true },
          village: { type: String, required: true },
        },
      },
    },
    negotiatedPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Negotiation ||
  mongoose.model("Negotiation", NegotiationSchema);
