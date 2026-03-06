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
  getAllProductsAdmin: vi.fn().mockResolvedValue([]),
  createProduct: vi.fn().mockResolvedValue(10),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  toggleProductAvailability: vi.fn().mockResolvedValue(undefined),
  seedProductsIfEmpty: vi.fn().mockResolvedValue(undefined),
  createOrder: vi.fn().mockResolvedValue(42),
  getAllOrders: vi.fn().mockResolvedValue([]),
  getOrderById: vi.fn().mockResolvedValue(null),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  updateOrderStripePaymentIntentId: vi.fn().mockResolvedValue(undefined),
  getOrderStatsByDay: vi.fn().mockResolvedValue([]),
  getOrderStatsByPayment: vi.fn().mockResolvedValue([]),
  getOrderSummaryStats: vi.fn().mockResolvedValue({ totalOrders: 0, totalRevenue: 0, avgTicket: 0, pendingOrders: 0 }),
  createCustomer: vi.fn().mockResolvedValue(5),
  getCustomerByPhone: vi.fn().mockResolvedValue(null),
  getAllCustomers: vi.fn().mockResolvedValue([]),
  getAllDeliveryPersons: vi.fn().mockResolvedValue([]),
  getDeliveryPersonByPin: vi.fn().mockImplementation((pin: string) =>
    pin === "1234"
      ? Promise.resolve({ id: 1, name: "João Entregador", phone: "21999999999", pin: "1234", active: true, createdAt: new Date(), updatedAt: new Date() })
      : Promise.resolve(null)
  ),
  getDeliveryPersonById: vi.fn().mockImplementation((id: number) =>
    id === 1
      ? Promise.resolve({ id: 1, name: "João Entregador", phone: "21999999999", pin: "1234", active: true, createdAt: new Date(), updatedAt: new Date() })
      : Promise.resolve(null)
  ),
  createDeliveryPerson: vi.fn().mockResolvedValue(1),
  updateDeliveryPerson: vi.fn().mockResolvedValue(undefined),
  assignOrderToDeliveryPerson: vi.fn().mockResolvedValue(undefined),
  getOrdersByDeliveryPerson: vi.fn().mockResolvedValue([]),
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

describe("products.listAdmin", () => {
  it("deve retornar lista de produtos para admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const products = await caller.products.listAdmin();
    expect(Array.isArray(products)).toBe(true);
  });

  it("deve bloquear acesso para não-admin", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.products.listAdmin()).rejects.toThrow();
  });
});

describe("products.create (admin)", () => {
  it("deve criar um produto e retornar o ID", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.products.create({
      name: "Açaí KitKat 500ml",
      description: "Com pedacinhos de KitKat",
      price: "22.90",
      category: "açaí",
      available: true,
    });
    expect(result.productId).toBe(10);
  });
});

describe("delivery.login", () => {
  it("deve retornar dados do entregador com PIN válido", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.delivery.login({ pin: "1234" });
    expect(result.id).toBe(1);
    expect(result.name).toBe("João Entregador");
  });

  it("deve rejeitar PIN inválido", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.delivery.login({ pin: "9999" })).rejects.toThrow();
  });
});

describe("delivery.myOrders", () => {
  it("deve retornar pedidos do entregador autenticado", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const orders = await caller.delivery.myOrders({ deliveryPersonId: 1 });
    expect(Array.isArray(orders)).toBe(true);
  });

  it("deve rejeitar entregador inexistente", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.delivery.myOrders({ deliveryPersonId: 999 })).rejects.toThrow();
  });
});

describe("delivery.list (admin)", () => {
  it("deve listar entregadores para admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const list = await caller.delivery.list();
    expect(Array.isArray(list)).toBe(true);
  });

  it("deve bloquear acesso para não-admin", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.delivery.list()).rejects.toThrow();
  });
});

describe("reports.summary (admin)", () => {
  it("deve retornar métricas resumidas", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const summary = await caller.reports.summary();
    expect(summary).toHaveProperty("totalOrders");
    expect(summary).toHaveProperty("totalRevenue");
    expect(summary).toHaveProperty("avgTicket");
    expect(summary).toHaveProperty("pendingOrders");
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
