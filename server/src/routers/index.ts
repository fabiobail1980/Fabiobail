import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { Client, Kit, Order, OrderItem, Product } from "@locacao/shared";
import {
  clients,
  kits,
  nextClientId,
  nextKitId,
  nextOrderId,
  nextOrderItemId,
  nextProductId,
  orders,
  products,
} from "../utils/store.js";

const t = initTRPC.create();

const productInput = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  totalQuantity: z.number().int().nonnegative(),
  pricePerUnit: z.number().int().nonnegative(),
  replacementValue: z.number().int().nonnegative().default(0),
  photoUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
});

const kitItemInput = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const kitInput = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  totalPrice: z.number().int().nonnegative(),
  items: z.array(kitItemInput).default([]),
});

const clientInput = z.object({
  name: z.string().min(1),
  documentType: z.enum(["cpf", "cnpj"]),
  document: z.string().min(5),
  phone: z.string().min(6),
  email: z.string().email(),
  address: z.string().min(3),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
});

const orderItemInput = z.object({
  itemType: z.enum(["product", "kit"]),
  productId: z.number().int().positive().optional(),
  kitId: z.number().int().positive().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().nonnegative(),
});

const orderInput = z.object({
  clientId: z.number().int().positive(),
  eventAddress: z.string().min(3),
  withdrawalDate: z.string().min(3),
  returnDate: z.string().min(3),
  contractType: z.enum(["pickup", "delivery"]),
  deliveryFee: z.number().int().nonnegative().default(0),
  totalPrice: z.number().int().nonnegative().default(0),
  status: z.enum(["pending", "confirmed", "delivered", "returned", "cancelled"]).default("pending"),
  notes: z.string().optional().nullable(),
  items: z.array(orderItemInput).default([]),
});

export const appRouter = t.router({
  products: t.router({
    list: t.procedure.query(() => products),
    getById: t.procedure.input(z.number().int().positive()).query(({ input }) =>
      products.find((product) => product.id === input),
    ),
    create: t.procedure.input(productInput).mutation(({ input }) => {
      const product: Product = {
        id: nextProductId(),
        name: input.name,
        category: input.category,
        totalQuantity: input.totalQuantity,
        pricePerUnit: input.pricePerUnit,
        replacementValue: input.replacementValue ?? 0,
        photoUrl: input.photoUrl ?? undefined,
        description: input.description ?? undefined,
      };
      products.push(product);
      return product;
    }),
    update: t.procedure
      .input(z.object({ id: z.number().int().positive(), data: productInput }))
      .mutation(({ input }) => {
        const index = products.findIndex((product) => product.id === input.id);
        if (index === -1) return null;
        const updated: Product = {
          ...products[index],
          ...input.data,
          replacementValue: input.data.replacementValue ?? 0,
          photoUrl: input.data.photoUrl ?? undefined,
          description: input.data.description ?? undefined,
        };
        products[index] = updated;
        return updated;
      }),
    delete: t.procedure.input(z.number().int().positive()).mutation(({ input }) => {
      const index = products.findIndex((product) => product.id === input);
      if (index === -1) return false;
      products.splice(index, 1);
      return true;
    }),
  }),
  kits: t.router({
    list: t.procedure.query(() => kits),
    getById: t.procedure.input(z.number().int().positive()).query(({ input }) =>
      kits.find((kit) => kit.id === input),
    ),
    create: t.procedure.input(kitInput).mutation(({ input }) => {
      const kit: Kit = {
        id: nextKitId(),
        name: input.name,
        description: input.description ?? undefined,
        totalPrice: input.totalPrice,
        items: input.items,
      };
      kits.push(kit);
      return kit;
    }),
    update: t.procedure
      .input(z.object({ id: z.number().int().positive(), data: kitInput }))
      .mutation(({ input }) => {
        const index = kits.findIndex((kit) => kit.id === input.id);
        if (index === -1) return null;
        const updated: Kit = {
          ...kits[index],
          ...input.data,
          description: input.data.description ?? undefined,
          items: input.data.items,
        };
        kits[index] = updated;
        return updated;
      }),
    delete: t.procedure.input(z.number().int().positive()).mutation(({ input }) => {
      const index = kits.findIndex((kit) => kit.id === input);
      if (index === -1) return false;
      kits.splice(index, 1);
      return true;
    }),
  }),
  clients: t.router({
    list: t.procedure.query(() => clients),
    getById: t.procedure.input(z.number().int().positive()).query(({ input }) =>
      clients.find((client) => client.id === input),
    ),
    create: t.procedure.input(clientInput).mutation(({ input }) => {
      const client: Client = {
        id: nextClientId(),
        name: input.name,
        documentType: input.documentType,
        document: input.document,
        phone: input.phone,
        email: input.email,
        address: input.address,
        city: input.city ?? undefined,
        state: input.state ?? undefined,
        zipCode: input.zipCode ?? undefined,
      };
      clients.push(client);
      return client;
    }),
    update: t.procedure
      .input(z.object({ id: z.number().int().positive(), data: clientInput }))
      .mutation(({ input }) => {
        const index = clients.findIndex((client) => client.id === input.id);
        if (index === -1) return null;
        const updated: Client = {
          ...clients[index],
          ...input.data,
          city: input.data.city ?? undefined,
          state: input.data.state ?? undefined,
          zipCode: input.data.zipCode ?? undefined,
        };
        clients[index] = updated;
        return updated;
      }),
    delete: t.procedure.input(z.number().int().positive()).mutation(({ input }) => {
      const index = clients.findIndex((client) => client.id === input);
      if (index === -1) return false;
      clients.splice(index, 1);
      return true;
    }),
  }),
  orders: t.router({
    list: t.procedure.query(() => orders),
    getById: t.procedure.input(z.number().int().positive()).query(({ input }) =>
      orders.find((order) => order.id === input),
    ),
    create: t.procedure.input(orderInput).mutation(({ input }) => {
      const mappedItems: OrderItem[] = input.items.map((item) => ({
        id: nextOrderItemId(),
        itemType: item.itemType,
        productId: item.productId,
        kitId: item.kitId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      const order: Order = {
        id: nextOrderId(),
        clientId: input.clientId,
        eventAddress: input.eventAddress,
        withdrawalDate: input.withdrawalDate,
        returnDate: input.returnDate,
        contractType: input.contractType,
        deliveryFee: input.deliveryFee ?? 0,
        totalPrice: input.totalPrice ?? 0,
        status: input.status ?? "pending",
        notes: input.notes ?? undefined,
        items: mappedItems,
      };
      orders.push(order);
      return order;
    }),
    update: t.procedure
      .input(z.object({ id: z.number().int().positive(), data: orderInput }))
      .mutation(({ input }) => {
        const index = orders.findIndex((order) => order.id === input.id);
        if (index === -1) return null;
        const mappedItems: OrderItem[] = input.data.items.map((item) => ({
          id: nextOrderItemId(),
          itemType: item.itemType,
          productId: item.productId,
          kitId: item.kitId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }));
        const updated: Order = {
          ...orders[index],
          ...input.data,
          deliveryFee: input.data.deliveryFee ?? 0,
          totalPrice: input.data.totalPrice ?? 0,
          status: input.data.status ?? "pending",
          notes: input.data.notes ?? undefined,
          items: mappedItems,
        };
        orders[index] = updated;
        return updated;
      }),
    delete: t.procedure.input(z.number().int().positive()).mutation(({ input }) => {
      const index = orders.findIndex((order) => order.id === input);
      if (index === -1) return false;
      orders.splice(index, 1);
      return true;
    }),
  }),
});

export type AppRouter = typeof appRouter;
