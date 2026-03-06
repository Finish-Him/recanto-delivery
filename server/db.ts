import { eq, desc, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertProduct, users, products, orders, orderItems, customers, deliveryPersons, InsertOrder, InsertOrderItem, Order, OrderItem, Product, Customer, InsertCustomer, DeliveryPerson, InsertDeliveryPerson } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.available, true));
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function createProduct(
  data: Omit<InsertProduct, "id" | "createdAt" | "updatedAt">
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(products).values([data]);
  return (result as { insertId: number }).insertId;
}

export async function updateProduct(
  id: number,
  data: Partial<Omit<InsertProduct, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function toggleProductAvailability(id: number, available: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ available }).where(eq(products.id, id));
}

export async function seedProductsIfEmpty(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(products).limit(1);
  if (existing.length > 0) return;

  await db.insert(products).values([
    {
      name: "Açaí Tradicional 500ml",
      description: "Açaí puro batido na hora com granola crocante, banana fresca e leite condensado. Uma explosão de sabor e energia!",
      price: "18.90",
      imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80",
      category: "açaí",
      available: true,
    },
  ]);
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type CreateOrderInput = {
  order: Omit<InsertOrder, "id" | "createdAt" | "updatedAt">;
  items: Array<Omit<InsertOrderItem, "id" | "orderId" | "createdAt">>;
};

export async function createOrder(input: CreateOrderInput): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(orders).values(input.order);
  const orderId = (result as { insertId: number }).insertId;

  const itemsWithOrderId = input.items.map((item) => ({
    ...item,
    orderId,
  }));

  await db.insert(orderItems).values(itemsWithOrderId);
  return orderId;
}

export type OrderWithItems = Order & { items: OrderItem[] };

export async function getAllOrders(): Promise<(OrderWithItems & { deliveryPersonName: string | null })[]> {
  const db = await getDb();
  if (!db) return [];

  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const allItems = await db.select().from(orderItems);

  // Fetch delivery person names for orders that have one
  const deliveryPersonIds = Array.from(new Set(allOrders.map((o) => o.deliveryPersonId).filter((id): id is number => id !== null && id !== undefined)));
  let deliveryPersonMap: Record<number, string> = {};
  if (deliveryPersonIds.length > 0) {
    const persons = await db
      .select({ id: deliveryPersons.id, name: deliveryPersons.name })
      .from(deliveryPersons)
      .where(sql`${deliveryPersons.id} IN (${sql.join(deliveryPersonIds.map((id) => sql`${id}`), sql`, `)})`);
    deliveryPersonMap = Object.fromEntries(persons.map((p) => [p.id, p.name]));
  }

  return allOrders.map((order) => ({
    ...order,
    deliveryPersonName: order.deliveryPersonId ? (deliveryPersonMap[order.deliveryPersonId] ?? null) : null,
    items: allItems.filter((item) => item.orderId === order.id),
  }));
}

export async function getOrderById(id: number): Promise<OrderWithItems | null> {
  const db = await getDb();
  if (!db) return null;

  const orderResult = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (orderResult.length === 0) return null;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return { ...orderResult[0], items };
}

export async function updateOrderStatus(
  id: number,
  status: Order["status"]
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function updateOrderStripePaymentIntentId(
  id: number,
  stripePaymentIntentId: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ stripePaymentIntentId }).where(eq(orders.id, id));
}

// ─── Reports ────────────────────────────────────────────────────────────────

export type DailyStat = { date: string; count: number; revenue: number };

export async function getOrderStatsByDay(days: number): Promise<DailyStat[]> {
  const db = await getDb();
  if (!db) return [];

  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`.as("date"),
      count: sql<number>`COUNT(*)`.as("count"),
      revenue: sql<number>`SUM(CAST(${orders.totalAmount} AS DECIMAL(10,2)))`.as("revenue"),
    })
    .from(orders)
    .where(gte(orders.createdAt, since))
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt})`);

  return rows.map((r) => ({
    date: String(r.date),
    count: Number(r.count),
    revenue: Number(r.revenue),
  }));
}

export type PaymentStat = { method: string; count: number; revenue: number };

export async function getOrderStatsByPayment(): Promise<PaymentStat[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      method: orders.paymentMethod,
      count: sql<number>`COUNT(*)`.as("count"),
      revenue: sql<number>`SUM(CAST(${orders.totalAmount} AS DECIMAL(10,2)))`.as("revenue"),
    })
    .from(orders)
    .groupBy(orders.paymentMethod);

  return rows.map((r) => ({
    method: String(r.method),
    count: Number(r.count),
    revenue: Number(r.revenue),
  }));
}

export type SummaryStats = {
  totalOrders: number;
  totalRevenue: number;
  avgTicket: number;
  pendingOrders: number;
};

export async function getOrderSummaryStats(): Promise<SummaryStats> {
  const db = await getDb();
  if (!db) return { totalOrders: 0, totalRevenue: 0, avgTicket: 0, pendingOrders: 0 };

  const [totals] = await db
    .select({
      totalOrders: sql<number>`COUNT(*)`,
      totalRevenue: sql<number>`SUM(CAST(${orders.totalAmount} AS DECIMAL(10,2)))`,
    })
    .from(orders);

  const [pending] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(eq(orders.status, "pendente"));

  const total = Number(totals?.totalOrders ?? 0);
  const revenue = Number(totals?.totalRevenue ?? 0);
  return {
    totalOrders: total,
    totalRevenue: revenue,
    avgTicket: total > 0 ? revenue / total : 0,
    pendingOrders: Number(pending?.count ?? 0),
  };
}

// ─── Delivery Persons ────────────────────────────────────────────────────────────────

export async function getAllDeliveryPersons(): Promise<DeliveryPerson[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliveryPersons).orderBy(desc(deliveryPersons.createdAt));
}

export async function getDeliveryPersonByPin(pin: string): Promise<DeliveryPerson | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(deliveryPersons)
    .where(eq(deliveryPersons.pin, pin))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getDeliveryPersonById(id: number): Promise<DeliveryPerson | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(deliveryPersons)
    .where(eq(deliveryPersons.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createDeliveryPerson(
  data: Omit<InsertDeliveryPerson, "id" | "createdAt" | "updatedAt">
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(deliveryPersons).values([data]);
  return (result as { insertId: number }).insertId;
}

export async function updateDeliveryPerson(
  id: number,
  data: Partial<Omit<InsertDeliveryPerson, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(deliveryPersons).set(data).where(eq(deliveryPersons.id, id));
}

export async function assignOrderToDeliveryPerson(
  orderId: number,
  deliveryPersonId: number | null
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ deliveryPersonId }).where(eq(orders.id, orderId));
}

export async function getOrdersByDeliveryPerson(deliveryPersonId: number): Promise<OrderWithItems[]> {
  const db = await getDb();
  if (!db) return [];
  const assignedOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.deliveryPersonId, deliveryPersonId))
    .orderBy(desc(orders.createdAt));
  const allItems = await db.select().from(orderItems);
  return assignedOrders.map((order) => ({
    ...order,
    items: allItems.filter((item) => item.orderId === order.id),
  }));
}

// ─── Customers ──────────────────────────────────────────────────────────────────

export async function createCustomer(
  data: Omit<InsertCustomer, "id" | "createdAt" | "updatedAt" | "totalOrders">
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(customers).values(data);
  return (result as { insertId: number }).insertId;
}

export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllCustomers(): Promise<Customer[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).orderBy(desc(customers.createdAt));
}
