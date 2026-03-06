import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock do banco de dados
vi.mock("./db", () => ({
  getAllProducts: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Açaí Tradicional 500ml",
      description: "Açaí puro batido na hora",
      price: "18.90",
      imageUrl: null,
      category: "açaí",
      available: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  seedProductsIfEmpty: vi.fn().mockResolvedValue(undefined),
  createOrder: vi.fn().mockResolvedValue(42),
  getAllOrders: vi.fn().mockResolvedValue([]),
  getOrderById: vi.fn().mockResolvedValue(null),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  updateOrderStripePaymentIntentId: vi.fn().mockResolvedValue(undefined),
}));

// Mock das notificações
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock do Stripe
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      paymentIntents: {
        create: vi.fn().mockResolvedValue({
          id: "pi_test_123",
          client_secret: "pi_test_123_secret",
        }),
      },
    })),
  };
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-open-id",
      email: "admin@recanto.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("products.list", () => {
  it("deve retornar a lista de produtos disponíveis", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const products = await caller.products.list();

    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Açaí Tradicional 500ml");
    expect(products[0].price).toBe("18.90");
  });
});

describe("orders.create", () => {
  it("deve criar um pedido com pagamento em dinheiro e retornar o ID", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.orders.create({
      customerName: "João Silva",
      customerPhone: "(11) 99999-9999",
      address: "Rua das Flores, 123",
      neighborhood: "Centro",
      paymentMethod: "dinheiro",
      totalAmount: "18.90",
      items: [
        {
          productId: 1,
          productName: "Açaí Tradicional 500ml",
          quantity: 1,
          unitPrice: "18.90",
          subtotal: "18.90",
        },
      ],
    });

    expect(result.orderId).toBe(42);
  });

  it("deve criar um pedido com troco (changeFor) quando pagamento em dinheiro", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.orders.create({
      customerName: "Maria Santos",
      address: "Av. Brasil, 456",
      paymentMethod: "dinheiro",
      changeFor: "50.00",
      totalAmount: "23.80",
      items: [
        {
          productId: 1,
          productName: "Açaí Tradicional 500ml",
          quantity: 1,
          unitPrice: "18.90",
          subtotal: "18.90",
        },
      ],
    });

    expect(result.orderId).toBe(42);
  });

  it("deve rejeitar pedido com nome muito curto", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.orders.create({
        customerName: "A",
        address: "Rua das Flores, 123",
        paymentMethod: "pix",
        totalAmount: "18.90",
        items: [
          {
            productId: 1,
            productName: "Açaí Tradicional 500ml",
            quantity: 1,
            unitPrice: "18.90",
            subtotal: "18.90",
          },
        ],
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar pedido com endereço muito curto", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.orders.create({
        customerName: "João Silva",
        address: "Rua",
        paymentMethod: "pix",
        totalAmount: "18.90",
        items: [
          {
            productId: 1,
            productName: "Açaí Tradicional 500ml",
            quantity: 1,
            unitPrice: "18.90",
            subtotal: "18.90",
          },
        ],
      })
    ).rejects.toThrow();
  });
});

describe("orders.list (admin)", () => {
  it("deve retornar lista vazia para admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const orders = await caller.orders.list();
    expect(orders).toEqual([]);
  });

  it("deve bloquear acesso para usuário não-admin", async () => {
    const userCtx: TrpcContext = {
      ...createPublicContext(),
      user: {
        id: 2,
        openId: "user-open-id",
        email: "user@test.com",
        name: "User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    };
    const caller = appRouter.createCaller(userCtx);
    await expect(caller.orders.list()).rejects.toThrow("Acesso restrito ao administrador.");
  });
});
