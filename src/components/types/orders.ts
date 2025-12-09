export interface Orders {
  TransMode: string;
  buyerId: string;
  buyername: string;
  cart: string;
  availableQuantity: string;
  category: string;
  confirmId: string;
  description: string;
  hasConformed: string;
  hasPayment: string;
  hasReject: string;
  image: string;
  isDelivered: string;
  Farmername: string;
  price: string;
  prodID: string;
  prod_name: string;
  quantity: string;
  farmerId: string;
  createdAt: string;
  walletAmount: string;
}

export interface Negotiation {
  BuyerId: string;
  BuyerName: string;
  FarmerId: string;
  FarmerName: string;
  NegoPrice: number;
  Origprice: number;
  accept: boolean;
  category: string;
  description: string;
  imageUrl: string;
  prodId: string;
  prod_name: string;
  quantity: number;
  reject: boolean;
}

export interface Cart {
  availableQuantity:number;
  confirmId:string;
  description:string;
  hasConformed:boolean;
  hasPayment:boolean;
  hasReject:boolean;
  imageUrl:string;
  isDelivered:boolean;
  FarmerName:string;
  price:number;
  prodId:string;
  prod_name:string;
  quantity: number;
  farmerId: string;
}
