import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de produtos (cardápio)
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("imageUrl"),
  category: varchar("category", { length: 100 }).default("açaí"),
  available: boolean("available").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Tabela de pedidos
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }),
  address: text("address").notNull(),
  neighborhood: varchar("neighborhood", { length: 255 }),
  complement: varchar("complement", { length: 255 }),
  paymentMethod: mysqlEnum("paymentMethod", [
    "dinheiro",
    "pix",
    "cartao_debito",
    "cartao_credito",
    "cartao_online",
  ]).notNull(),
  status: mysqlEnum("status", [
    "pendente",
    "confirmado",
    "em_preparo",
    "saiu_entrega",
    "entregue",
    "cancelado",
  ])
    .default("pendente")
    .notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default("4.90").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  changeFor: decimal("changeFor", { precision: 10, scale: 2 }),
  notes: text("notes"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  deliveryPersonId: int("deliveryPersonId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Tabela de itens do pedido
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId")
    .notNull()
    .references(() => orders.id),
  productId: int("productId")
    .notNull()
    .references(() => products.id),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  addonsJson: text("addonsJson"),   // JSON: [{addonId, addonName, price}]
  notes: text("notes"),             // observações livres do cliente
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Tabela de entregadores (trabalhadores contratados)
export const deliveryPersons = mysqlTable("deliveryPersons", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  pin: varchar("pin", { length: 6 }).notNull(), // PIN de 4-6 dígitos para login
  cpf: varchar("cpf", { length: 14 }),           // CPF formatado: 000.000.000-00
  shift: mysqlEnum("shift", ["manha", "tarde", "noite", "integral"]).default("integral"),
  hiredAt: varchar("hiredAt", { length: 10 }),   // Data de admissão: YYYY-MM-DD
  notes: text("notes"),                          // Observações internas
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeliveryPerson = typeof deliveryPersons.$inferSelect;
export type InsertDeliveryPerson = typeof deliveryPersons.$inferInsert;

// Tabela de clientes cadastrados (sem OAuth, cadastro simples)
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  neighborhood: varchar("neighborhood", { length: 255 }),
  complement: varchar("complement", { length: 255 }),
  birthDate: varchar("birthDate", { length: 10 }),
  totalOrders: int("totalOrders").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// Categorias de adicionais por produto (ex: "Complementos", "Coberturas", "Frutas")
export const addonCategories = mysqlTable("addonCategories", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId")
    .notNull()
    .references(() => products.id),
  name: varchar("name", { length: 100 }).notNull(), // ex: "Complementos", "Coberturas"
  required: boolean("required").default(false).notNull(), // obrigatório selecionar?
  minSelect: int("minSelect").default(0).notNull(),       // mínimo de seleções
  maxSelect: int("maxSelect").default(1).notNull(),       // máximo (1 = radio, >1 = checkbox)
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AddonCategory = typeof addonCategories.$inferSelect;
export type InsertAddonCategory = typeof addonCategories.$inferInsert;

// Adicionais individuais dentro de uma categoria
export const addons = mysqlTable("addons", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId")
    .notNull()
    .references(() => addonCategories.id),
  name: varchar("name", { length: 150 }).notNull(), // ex: "Granola", "Leite Ninho"
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00").notNull(), // 0 = grátis
  available: boolean("available").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Addon = typeof addons.$inferSelect;
export type InsertAddon = typeof addons.$inferInsert;