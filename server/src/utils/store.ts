import type { Client, Kit, Order, Product } from "@locacao/shared";

let productId = 1;
let kitId = 1;
let clientId = 1;
let orderId = 1;
let orderItemId = 1;

export const products: Product[] = [];
export const kits: Kit[] = [];
export const clients: Client[] = [];
export const orders: Order[] = [];

export const nextProductId = () => productId++;
export const nextKitId = () => kitId++;
export const nextClientId = () => clientId++;
export const nextOrderId = () => orderId++;
export const nextOrderItemId = () => orderItemId++;
