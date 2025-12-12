import { number, z } from "zod";

export const wasteFormSchema = z.object({
  title: z.string().min(1, "title is required"),

  wasteType: z.enum(["crop", "fruit", "vegetable" ,""]),
  wasteProduct: z.string().min(1, "wasteProduct is required"),

  description: z.string().min(1, "description is required"),

  quantity: z.coerce.number().int("quantity is required"),
  moisture: z.string().min(1, "moisture is required"),
  price: z.coerce.number().int("price is required"),
  imageUrl: z.string().min(1, "image is required"),
  

  seller: z.object({
    farmerId: z.string().min(1, "farmerId is required"),
    name: z.string().min(1, "name is required"),
    phone: z.string().min(1, "phone is required"),
    email: z.string().email("valid email is required"),
  }),

  address: z.object({
    houseBuildingName: z.string().min(1, "house/building name is required"),
    roadarealandmarkName: z.string().min(1, "road/area/landmark is required"),
    state: z.string().min(1, "state is required"),
    district: z.string().min(1, "district is required"),
    taluka: z.string().min(1, "taluka is required"),
    village: z.string().min(1, "village is required"),
  }),

  unit: z.enum(["kg", "ton", "gram" , ""]),
});

export type wasteFormDataType = z.infer<typeof wasteFormSchema>;
