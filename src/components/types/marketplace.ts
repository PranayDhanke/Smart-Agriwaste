import { Address, Seller, WasteType } from "./ListWaste";

export interface FilterState {
  search: string;
  category: string;
  address: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

export interface WasteItem {
  _id: string;
  title: string;
  wasteType: WasteType;
  wasteProduct: string;
  quantity: string;
  address: Address;
  moisture: string;
  price: string;
  description: string;
  imageUrl: string;
}

export interface SingleWasteItem {
  _id: string;
  title: string;
  wasteType: WasteType;
  wasteProduct: string;
  quantity: string;
  address: Address;
  moisture: string;
  price: string;
  description: string;
  imageUrl: string;
  seller: Seller
}


