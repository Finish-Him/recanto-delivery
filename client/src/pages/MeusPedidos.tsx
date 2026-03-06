import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { ArrowLeft, ClipboardList, RefreshCw, LogIn, Package, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const PURPLE = "oklch(0.38 0.22 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pendente:     { label: "Pendente",       color: "#92400e", bg: "#fef3c7" },
  confirmado:   { label: "Confirmado",     color: "#1e40af", bg: "#dbeafe" },
  em_preparo:   { label: "Em preparo",     color: "#6b21a8", bg: "#f3e8ff" },
  saiu_entrega: { label: "Saiu p/ entrega",color: "#0f766e", bg: "#ccfbf1" },
  entregue:     { label: "Entregue ✓",     color: "#166534", bg: "#dcfce7" },
  cancelado:    { label: "Cancelado",      color: "#991b1b", bg: "#fee2e2" },
};

const PAYMENT_LABELS: Record<string, string> = {
  dinheiro:       "Dinheiro",
  pix:            "PIX",
  cartao_debito:  "Cartão Débito",
  cartao_credito: "Cartão Crédito",
  cartao_online:  "Cartão Online",
};

type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  addonsJson?: string | null;
  notes?: string | null;
};

type Order = {
  id: number;
  customerName: string;
  address: string;
  neighborhood?: string | null;
  paymentMethod: string;
  status: string;
  totalAmount: string;
  deliveryFee: string;
  changeFor?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  items: OrderItem[];
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const { addItem, setIsOpen } = useCart();
  const [, navigate] = useLocation();

  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: GRAY, bg: "#f3f4f6" };
  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const handleRepeat = () => {
    order.items.forEach((item) => {
      let addonsTotal = 0;
      let selectedAddons: { addonId: number; addonName: string; price: number; categoryName: string }[] = [];
      if (item.addonsJson) {
        try {
          const parsed = JSON.parse(item.addonsJson);
          selectedAddons = parsed;
          addonsTotal = parsed.reduce((sum: number, a: { price: number }) => sum + (a.price ?? 0), 0);
        } catch { /* ignore */ }
      }
      // addItem adiciona 1 por vez, então chamamos N vezes para replicar a quantidade
      for (let q = 0; q < item.quantity; q++) {
        addItem({
          productId: item.productId,
          productName: item.productName,
          unitPrice: parseFloat(item.unitPrice),
          selectedAddons,
          addonsTotal,
          notes: item.notes ?? "",
        });
      }
    });
    toast.success("Itens adicionados ao carrinho!", { description: "Confira seu carrinho para finalizar o pedido." });
    setIsOpen(true);
    navigate("/");
  };

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm transition-all"
      style={{ background: WHITE, border: `2px solid ${BORDER}` }}
    >
      {/* Header do card */}
      <div
        className="px-4 py-3 flex items-center justify-between gap-3 cursor-pointer"
        style={{ background: "oklch(0.97 0.02 305)" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
            style={{ background: PURPLE, color: WHITE }}
          >
            #{order.id}
          </div>
          <div className="min-w-0">
            <p className="font-black text-sm leading-tight truncate" style={{ color: DARK }}>
              {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
            </p>
            <p className="text-xs font-semibold" style={{ color: GRAY }}>
              {dateStr} às {timeStr}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-black"
            style={{ color: statusInfo.color, background: statusInfo.bg }}
          >
            {statusInfo.label}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" style={{ color: GRAY }} /> : <ChevronDown className="w-4 h-4" style={{ color: GRAY }} />}
        </div>
      </div>

      {/* Detalhes expandidos */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 flex flex-col gap-3">
          {/* Itens */}
          <div className="flex flex-col gap-2">
            {order.items.map((item) => {
              let addons: { addonName: string; price: number }[] = [];
              if (item.addonsJson) {
                try { addons = JSON.parse(item.addonsJson); } catch { /* ignore */ }
              }
              return (
                <div key={item.id} className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold" style={{ color: DARK }}>
                      {item.quantity}× {item.productName}
                    </span>
                    <span className="text-sm font-black" style={{ color: PURPLE }}>
                      R$ {parseFloat(item.subtotal).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  {addons.length > 0 && (
                    <div className="pl-4 flex flex-col gap-0.5">
                      {addons.map((a, i) => (
                        <span key={i} className="text-xs font-semibold" style={{ color: GRAY }}>
                          + {a.addonName}{a.price > 0 ? ` (+R$ ${a.price.toFixed(2).replace(".", ",")})` : " (grátis)"}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <p className="pl-4 text-xs italic" style={{ color: GRAY }}>
                      Obs: {item.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Totais */}
          <div
            className="rounded-xl px-3 py-2 flex flex-col gap-1"
            style={{ background: "oklch(0.97 0.02 305)" }}
          >
            <div className="flex justify-between text-xs font-semibold" style={{ color: GRAY }}>
              <span>Frete</span>
              <span>R$ {parseFloat(order.deliveryFee).toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-sm font-black" style={{ color: DARK }}>
              <span>Total</span>
              <span style={{ color: PURPLE }}>R$ {parseFloat(order.totalAmount).toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold" style={{ color: GRAY }}>
              <span>Pagamento</span>
              <span>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
            </div>
            {order.changeFor && (
              <div className="flex justify-between text-xs font-semibold" style={{ color: GRAY }}>
                <span>Troco para</span>
                <span>R$ {parseFloat(order.changeFor).toFixed(2).replace(".", ",")}</span>
              </div>
            )}
          </div>

          {/* Endereço */}
          <p className="text-xs font-semibold" style={{ color: GRAY }}>
            📍 {order.address}{order.neighborhood ? `, ${order.neighborhood}` : ""}
          </p>

          {/* Botão repetir */}
          <button
            onClick={handleRepeat}
            className="flex items-center justify-center gap-2 w-full rounded-2xl font-black text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: PURPLE, color: WHITE, minHeight: 48 }}
          >
            <RefreshCw className="w-4 h-4" />
            Repetir Pedido
          </button>
        </div>
      )}
    </div>
  );
}

export default function MeusPedidos() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { data: orders, isLoading } = trpc.myOrders.list.useQuery(undefined, {
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: WHITE }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: PURPLE, borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={{ background: WHITE }}>
        <div className="w-20 h-20 rounded-full overflow-hidden border-4" style={{ borderColor: PURPLE }}>
          <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
        </div>
        <div className="text-center">
          <h2 className="font-black text-2xl mb-2" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
            Meus Pedidos
          </h2>
          <p className="text-sm font-semibold" style={{ color: GRAY }}>
            Entre na sua conta para ver o histórico de pedidos
          </p>
        </div>
        <a
          href={getLoginUrl()}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-base transition-all hover:opacity-90 active:scale-95"
          style={{ background: PURPLE, color: WHITE }}
        >
          <LogIn className="w-5 h-5" />
          Entrar na conta
        </a>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
          style={{ color: GRAY }}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-page-enter" style={{ background: WHITE }}>
      {/* Header */}
      <header className="sticky top-0 z-10 shadow-sm" style={{ background: PURPLE }}>
        <div className="container flex items-center gap-3" style={{ minHeight: 64 }}>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center rounded-full transition-all active:scale-95"
            style={{ background: "oklch(0.32 0.20 305)", color: WHITE, width: 44, height: 44 }}
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" style={{ color: GOLD }} />
            <h1 className="font-black text-lg" style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}>
              Meus Pedidos
            </h1>
          </div>
          {orders && orders.length > 0 && (
            <span
              className="ml-auto px-3 py-1 rounded-full text-xs font-black"
              style={{ background: GOLD, color: DARK }}
            >
              {orders.length} pedido{orders.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </header>

      <div className="container py-6 pb-16">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 rounded-2xl animate-pulse" style={{ background: "oklch(0.94 0.02 305)" }} />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.94 0.04 305)" }}
            >
              <Package className="w-10 h-10" style={{ color: PURPLE }} />
            </div>
            <div>
              <h3 className="font-black text-xl mb-2" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
                Nenhum pedido ainda
              </h3>
              <p className="text-sm font-semibold" style={{ color: GRAY }}>
                Seus próximos pedidos aparecerão aqui
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-base transition-all hover:opacity-90 active:scale-95"
              style={{ background: PURPLE, color: WHITE }}
            >
              Ver Cardápio
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold mb-1" style={{ color: GRAY }}>
              Olá, {(user.name ?? user.email ?? "").split(" ")[0]}! Aqui estão seus pedidos:
            </p>
            {(orders as Order[]).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
