import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getAllProducts,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  toggleProductAvailability,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderStripePaymentIntentId,
  seedProductsIfEmpty,
  createCustomer,
  getCustomerByPhone,
  getAllCustomers,
  getOrderStatsByDay,
  getOrderStatsByPayment,
  getOrderSummaryStats,
  getAllDeliveryPersons,
  getDeliveryPersonByPin,
  getDeliveryPersonById,
  createDeliveryPerson,
  updateDeliveryPerson,
  assignOrderToDeliveryPerson,
  getOrdersByDeliveryPerson,
  getDeliveryPersonStats,
  getProductWithAddons,
  getAddonCategoriesByProduct,
  createAddonCategory,
  updateAddonCategory,
  deleteAddonCategory,
  createAddon,
  updateAddon,
  deleteAddon,
} from "./db";
import { notifyOwner } from "./_core/notification";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao administrador." });
  }
  return next({ ctx });
});

const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.string(),
  subtotal: z.string(),
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Products ──────────────────────────────────────────────────────────────────────────────
  products: router({
    list: publicProcedure.query(async () => {
      await seedProductsIfEmpty();
      return getAllProducts();
    }),

    listAdmin: adminProcedure.query(async () => {
      return getAllProductsAdmin();
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(2),
          description: z.string().optional(),
          price: z.string(),
          imageUrl: z.string().optional(),
          category: z.string().default("açaí"),
          available: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const productId = await createProduct({
          name: input.name,
          description: input.description ?? null,
          price: input.price,
          imageUrl: input.imageUrl ?? null,
          category: input.category,
          available: input.available,
        });
        return { productId };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          name: z.string().min(2).optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          imageUrl: z.string().optional().nullable(),
          category: z.string().optional(),
          available: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProduct(id, data);
        return { success: true };
      }),

    toggleAvailability: adminProcedure
      .input(z.object({ id: z.number().int().positive(), available: z.boolean() }))
      .mutation(async ({ input }) => {
        await toggleProductAvailability(input.id, input.available);
        return { success: true };
      }),
  }),

  // ─── Reports ──────────────────────────────────────────────────────────────────────────────
  reports: router({
    summary: adminProcedure.query(async () => {
      return getOrderSummaryStats();
    }),

    byDay: adminProcedure
      .input(z.object({ days: z.number().int().min(7).max(90).default(30) }))
      .query(async ({ input }) => {
        return getOrderStatsByDay(input.days);
      }),

    byPayment: adminProcedure.query(async () => {
      return getOrderStatsByPayment();
    }),
  }),

  // ─── Orders ──────────────────────────────────────────────────────────────────────────────
  orders: router({
    create: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(2),
          customerPhone: z.string().optional(),
          address: z.string().min(5),
          neighborhood: z.string().optional(),
          complement: z.string().optional(),
          paymentMethod: z.enum([
            "dinheiro",
            "pix",
            "cartao_debito",
            "cartao_credito",
            "cartao_online",
          ]),
          deliveryFee: z.string().default("4.90"),
          totalAmount: z.string(),
          changeFor: z.string().optional(),
          notes: z.string().optional(),
          items: z.array(orderItemSchema).min(1),
        })
      )
      .mutation(async ({ input }) => {
        const { items, ...orderData } = input;

        const orderId = await createOrder({
          order: {
            customerName: orderData.customerName,
            customerPhone: orderData.customerPhone ?? null,
            address: orderData.address,
            neighborhood: orderData.neighborhood ?? null,
            complement: orderData.complement ?? null,
            paymentMethod: orderData.paymentMethod,
            deliveryFee: orderData.deliveryFee ?? "4.90",
            totalAmount: orderData.totalAmount,
            changeFor: orderData.changeFor ?? null,
            notes: orderData.notes ?? null,
            status: "pendente",
          },
          items,
        });

        const itemsSummary = items
          .map((i) => `${i.quantity}x ${i.productName} (R$ ${i.subtotal})`)
          .join(", ");

        const paymentLabels: Record<string, string> = {
          dinheiro: "Dinheiro",
          pix: "PIX",
          cartao_debito: "Cartão Débito",
          cartao_credito: "Cartão Crédito",
          cartao_online: "Cartão Online (Stripe)",
        };

        await notifyOwner({
          title: `\uD83D\uDEF5 Novo pedido #${orderId} - ${orderData.customerName}`,
          content: `**Pedido #${orderId}**\n\n**Cliente:** ${orderData.customerName}\n**Telefone:** ${orderData.customerPhone || "Não informado"}\n**Endereço:** ${orderData.address}${orderData.neighborhood ? `, ${orderData.neighborhood}` : ""}${orderData.complement ? ` - ${orderData.complement}` : ""}\n\n**Itens:** ${itemsSummary}\n**Frete:** R$ ${orderData.deliveryFee}\n\n**Total:** R$ ${orderData.totalAmount}\n**Pagamento:** ${paymentLabels[orderData.paymentMethod] || orderData.paymentMethod}${orderData.changeFor ? `\n**Troco para:** R$ ${orderData.changeFor}` : ""}${orderData.notes ? `\n\n**Observações:** ${orderData.notes}` : ""}`,
        });

        return { orderId };
      }),

    list: adminProcedure.query(async () => {
      return getAllOrders();
    }),

    getById: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const order = await getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado." });
        return order;
      }),

    // Rota pública para o cliente rastrear o próprio pedido (retorna apenas dados seguros)
    track: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const order = await getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Pedido não encontrado." });
        // Retorna apenas os campos necessários para o cliente (sem dados sensíveis)
        return {
          id: order.id,
          status: order.status,
          customerName: order.customerName,
          totalAmount: order.totalAmount,
          deliveryFee: order.deliveryFee,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: order.items,
        };
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum([
            "pendente",
            "confirmado",
            "em_preparo",
            "saiu_entrega",
            "entregue",
            "cancelado",
          ]),
        })
      )
      .mutation(async ({ input }) => {
        await updateOrderStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ─── Customers ─────────────────────────────────────────────────────────────
  customers: router({
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
          phone: z.string().min(10, "Telefone inválido"),
          email: z.string().email("E-mail inválido").optional().or(z.literal("")),
          address: z.string().optional(),
          neighborhood: z.string().optional(),
          complement: z.string().optional(),
          birthDate: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const existing = await getCustomerByPhone(input.phone);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Este telefone já está cadastrado." });
        }
        const customerId = await createCustomer({
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          address: input.address || null,
          neighborhood: input.neighborhood || null,
          complement: input.complement || null,
          birthDate: input.birthDate || null,
        });
        return { customerId, success: true };
      }),

    getByPhone: publicProcedure
      .input(z.object({ phone: z.string() }))
      .query(async ({ input }) => {
        return getCustomerByPhone(input.phone);
      }),

    list: adminProcedure.query(async () => {
      return getAllCustomers();
    }),
  }),

  // ─── Delivery Persons ──────────────────────────────────────────────────────────────────────────────
  delivery: router({
    // Login por PIN (público — o entregador não tem conta OAuth)
    login: publicProcedure
      .input(z.object({ pin: z.string().min(4).max(6) }))
      .mutation(async ({ input }) => {
        const person = await getDeliveryPersonByPin(input.pin);
        if (!person || !person.active) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "PIN inválido ou entregador inativo." });
        }
        return {
          id: person.id,
          name: person.name,
          phone: person.phone,
          shift: person.shift,
        };
      }),

    // Buscar dados do entregador por ID (público — usado pelo frontend após login)
    getById: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const person = await getDeliveryPersonById(input.id);
        if (!person || !person.active) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Entregador não encontrado." });
        }
        return { id: person.id, name: person.name, phone: person.phone, shift: person.shift };
      }),

    // Métricas de desempenho do entregador (admin)
    stats: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        return getDeliveryPersonStats(input.id);
      }),

    // Histórico de pedidos entregues (admin)
    orderHistory: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        return getOrdersByDeliveryPerson(input.id);
      }),

    // Pedidos atribuídos ao entregador (público — autenticado pelo ID salvo no localStorage)
    myOrders: publicProcedure
      .input(z.object({ deliveryPersonId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const person = await getDeliveryPersonById(input.deliveryPersonId);
        if (!person || !person.active) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Entregador não autorizado." });
        }
        return getOrdersByDeliveryPerson(input.deliveryPersonId);
      }),

    // Atualizar status do pedido (pelo entregador — apenas saiu_entrega e entregue)
    updateOrderStatus: publicProcedure
      .input(
        z.object({
          orderId: z.number().int().positive(),
          deliveryPersonId: z.number().int().positive(),
          status: z.enum(["saiu_entrega", "entregue"]),
        })
      )
      .mutation(async ({ input }) => {
        const person = await getDeliveryPersonById(input.deliveryPersonId);
        if (!person || !person.active) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Entregador não autorizado." });
        }
        const order = await getOrderById(input.orderId);
        if (!order || order.deliveryPersonId !== input.deliveryPersonId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Pedido não atribuído a este entregador." });
        }
        await updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),

    // Admin: listar todos os entregadores
    list: adminProcedure.query(async () => {
      return getAllDeliveryPersons();
    }),

    // Admin: criar entregador
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(2),
          phone: z.string().min(10),
          pin: z.string().min(4).max(6),
          cpf: z.string().optional(),
          shift: z.enum(["manha", "tarde", "noite", "integral"]).default("integral"),
          hiredAt: z.string().optional(),
          notes: z.string().optional(),
          active: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const id = await createDeliveryPerson({
          name: input.name,
          phone: input.phone,
          pin: input.pin,
          cpf: input.cpf ?? null,
          shift: input.shift,
          hiredAt: input.hiredAt ?? null,
          notes: input.notes ?? null,
          active: input.active,
        });
        return { id };
      }),

    // Admin: atualizar entregador
    update: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          name: z.string().min(2).optional(),
          phone: z.string().min(10).optional(),
          pin: z.string().min(4).max(6).optional(),
          cpf: z.string().optional().nullable(),
          shift: z.enum(["manha", "tarde", "noite", "integral"]).optional(),
          hiredAt: z.string().optional().nullable(),
          notes: z.string().optional().nullable(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateDeliveryPerson(id, data);
        return { success: true };
      }),

    // Admin: atribuir pedido a entregador
    assignOrder: adminProcedure
      .input(
        z.object({
          orderId: z.number().int().positive(),
          deliveryPersonId: z.number().int().positive().nullable(),
        })
      )
      .mutation(async ({ input }) => {
        await assignOrderToDeliveryPerson(input.orderId, input.deliveryPersonId);
        return { success: true };
      }),
  }),

  // ─── Addons ───────────────────────────────────────────────────────────────────
  addons: router({
    // Público: buscar produto com todas as categorias e adicionais
    getProduct: publicProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const product = await getProductWithAddons(input.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado." });
        return product;
      }),

    // Admin: listar categorias de adicionais por produto (inclui inativos)
    listCategories: adminProcedure
      .input(z.object({ productId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return getAddonCategoriesByProduct(input.productId);
      }),

    // Admin: criar categoria de adicionais
    createCategory: adminProcedure
      .input(z.object({
        productId: z.number().int().positive(),
        name: z.string().min(1).max(100),
        required: z.boolean().default(false),
        minSelect: z.number().int().min(0).default(0),
        maxSelect: z.number().int().min(1).default(1),
        sortOrder: z.number().int().default(0),
      }))
      .mutation(async ({ input }) => {
        const id = await createAddonCategory(input);
        return { id };
      }),

    // Admin: atualizar categoria
    updateCategory: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(100).optional(),
        required: z.boolean().optional(),
        minSelect: z.number().int().min(0).optional(),
        maxSelect: z.number().int().min(1).optional(),
        sortOrder: z.number().int().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateAddonCategory(id, data);
        return { success: true };
      }),

    // Admin: deletar categoria (e seus adicionais)
    deleteCategory: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteAddonCategory(input.id);
        return { success: true };
      }),

    // Admin: criar adicional
    createAddon: adminProcedure
      .input(z.object({
        categoryId: z.number().int().positive(),
        name: z.string().min(1).max(150),
        price: z.string().default("0.00"),
        available: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }))
      .mutation(async ({ input }) => {
        const id = await createAddon(input);
        return { id };
      }),

    // Admin: atualizar adicional
    updateAddon: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(150).optional(),
        price: z.string().optional(),
        available: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateAddon(id, data);
        return { success: true };
      }),

    // Admin: deletar adicional
    deleteAddon: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteAddon(input.id);
        return { success: true };
      }),
  }),

  // ─── Stripe ──────────────────────────────────────────────────────────────────
  stripe: router({
    createPaymentIntent: publicProcedure
      .input(
        z.object({
          amount: z.number().positive(),
          orderId: z.number().int().positive().optional(),
          customerName: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: input.amount,
          currency: "brl",
          automatic_payment_methods: { enabled: true },
          metadata: {
            orderId: input.orderId?.toString() ?? "",
            customerName: input.customerName ?? "",
          },
        });

        if (input.orderId) {
          await updateOrderStripePaymentIntentId(input.orderId, paymentIntent.id);
        }

        return { clientSecret: paymentIntent.client_secret };
      }),
  }),
});

export type AppRouter = typeof appRouter;
