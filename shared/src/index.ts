export type Role = "admin" | "user";
export type ContractType = "pickup" | "delivery";
export type OrderStatus = "pending" | "confirmed" | "delivered" | "returned" | "cancelled";

export interface Product {
  id: number;
  name: string;
  category: string;
  totalQuantity: number;
  pricePerUnit: number;
  replacementValue: number;
  photoUrl?: string;
  description?: string;
}

export interface KitItem {
  productId: number;
  quantity: number;
}

export interface Kit {
  id: number;
  name: string;
  description?: string;
  totalPrice: number;
  items: KitItem[];
}

export interface Client {
  id: number;
  name: string;
  documentType: "cpf" | "cnpj";
  document: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface OrderItem {
  id: number;
  itemType: "product" | "kit";
  productId?: number;
  kitId?: number;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  clientId: number;
  eventAddress: string;
  withdrawalDate: string;
  returnDate: string;
  contractType: ContractType;
  deliveryFee: number;
  totalPrice: number;
  status: OrderStatus;
  notes?: string;
  items: OrderItem[];
}
