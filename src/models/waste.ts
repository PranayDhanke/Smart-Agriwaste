import { WasteFormDataSchema } from "@/components/types/ListWaste";
import mongoose from "mongoose";

const wasteSchema = new mongoose.Schema<WasteFormDataSchema>({
  farmerId: { type: String, required: true },
  title: { type: String, required: true },
  wasteType: { type: String, required: true },
  description: { type: String, required: true },
  wasteProduct: { type: String, required: true },
  quantity: { type: Number, required: true },
  moisture: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  seller: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  address: {
    houseBuildingName: { type: String, required: true },
    roadarealandmarkName: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    taluka: { type: String, required: true },
    village: { type: String, required: true },
  },
});

const Waste = mongoose.models.Waste || mongoose.model("Waste", wasteSchema);

export default Waste;
