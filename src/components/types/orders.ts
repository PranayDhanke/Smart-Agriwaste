import { Address, Unit, WasteType } from "./ListWaste";

interface Seller {
  farmerId: string;
  farmerName: string;
}

interface sellerInfo {
  seller: Seller;
  address: Address;
}
export interface CartItem {
  prodId: string;
  title: string;
  wasteType: WasteType | "";
  wasteProduct: string;

  moisture: string;
  quantity: number;
  maxQuantity: number;
  price: number;
  unit: Unit | "";
  description: string;
  image: string;

  sellerInfo: sellerInfo;
}

export interface Negotiation {
  _id: string;

  buyerId: string;
  buyerName: string;

  farmerId: string;

  item: CartItem;

  negotiatedPrice: number;

  status: "pending" | "accepted" | "rejected";
}

export interface Order {
  _id: string;

  buyerId: string;
  buyerName: string;

  // quick filtering for farmer dashboard
  farmerId: string;

  items: CartItem[];

  transactionMode: "COD" | "ONLINE" | "WALLET";

  deliveryMode : "PICKUPBYBUYER" | "DELIVERYBYFARMER";

  status:
    | "pending"
    | "confirmed"
    | "cancelled";

  hasPayment: boolean;
  isDelivered: boolean;
  isOutForDelivery?: boolean;

  createdAt: string;
  updatedAt?: string;
}
