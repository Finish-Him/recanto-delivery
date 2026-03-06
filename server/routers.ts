import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getAllProducts,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderStripePaymentIntentId,
  seedProductsIfEmpty,
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

  // ─── Products ────────────────────────────────────────────────────────────────
  products: router({
    list: publicProcedure.query(async () => {
      await seedProductsIfEmpty();
      return getAllProducts();
    }),
  }),

  // ─── Orders ──────────────────────────────────────────────────────────────────
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
          content: `**Pedido #${orderId}**\n\n**Cliente:** ${orderData.customerName}\n**Telefone:** ${orderData.customerPhone || "Não informado"}\n**Endereço:** ${orderData.address}${orderData.neighborhood ? `, ${orderData.neighborhood}` : ""}${orderData.complement ? ` - ${orderData.complement}` : ""}\n\n**Itens:** ${itemsSummary}\n**Frete:** R$ ${orderData.deliveryFee}\n\n**Total:** R$ ${orderData.totalAmount}\n**Pagamento:** ${paymentLabels[orderData.paymentMethod] || orderData.paymentMethod}${orderData.notes ? `\n\n**Observações:** ${orderData.notes}` : ""}`,
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
