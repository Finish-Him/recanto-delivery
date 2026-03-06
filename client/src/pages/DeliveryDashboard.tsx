import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useDeliveryAuth } from "@/contexts/DeliveryAuthContext";
import { useLocation } from "wouter";
import {
  Bike,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle2,
  PackageCheck,
  ChevronDown,
  ChevronUp,
  LogOut,
  RefreshCw,
  Navigation,
  Clock,
  Banknote,
  CreditCard,
  Smartphone,
  AlertCircle,
  User,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PURPLE = "oklch(0.38 0.22 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";
const GREEN = "oklch(0.55 0.18 145)";
const ORANGE = "oklch(0.65 0.19 60)";
const STORE_PHONE = "5521981749450";

type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
};

type Order = {
  id: number;
  customerName: string;
  customerPhone: string | null;
  address: string;
  neighborhood: string | null;
  complement: string | null;
  paymentMethod: string;
  status: string;
  totalAmount: string;
  deliveryFee: string;
  changeFor: string | null;
  notes: string | null;
  createdAt: Date;
  items: OrderItem[];
};

const paymentLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  dinheiro: { label: "Dinheiro", icon: <Banknote className="w-4 h-4" /> },
  pix: { label: "PIX", icon: <Smartphone className="w-4 h-4" /> },
  cartao_debito: { label: "Débito", icon: <CreditCard className="w-4 h-4" /> },
  cartao_credito: { label: "Crédito", icon: <CreditCard className="w-4 h-4" /> },
  cartao_online: { label: "Online", icon: <CreditCard className="w-4 h-4" /> },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pendente: { label: "Pendente", color: GRAY, bg: "oklch(0.94 0.02 305)" },
  confirmado: { label: "Confirmado", color: ORANGE, bg: "oklch(0.97 0.06 60)" },
  em_preparo: { label: "Em Preparo", color: ORANGE, bg: "oklch(0.97 0.06 60)" },
  saiu_entrega: { label: "Saiu para Entrega", color: PURPLE, bg: "oklch(0.95 0.03 305)" },
  entregue: { label: "Entregue", color: GREEN, bg: "oklch(0.95 0.05 145)" },
  cancelado: { label: "Cancelado", color: "oklch(0.52 0.22 25)", bg: "oklch(0.97 0.05 25)" },
};

function formatCurrency(value: string | number) {
  return `R$ ${parseFloat(String(value)).toFixed(2).replace(".", ",")}`;
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function OrderCard({ order, deliveryPersonId }: { order: Order; deliveryPersonId: number }) {
  const utils = trpc.useUtils();
  const [expanded, setExpanded] = useState(false);

  const updateStatus = trpc.delivery.updateOrderStatus.useMutation({
    onSuccess: (_, vars) => {
      const msg = vars.status === "saiu_entrega" ? "Retirada confirmada!" : "Entrega confirmada!";
      toast.success(msg);
      utils.delivery.myOrders.invalidate();
    },
    onError: (err) => toast.error("Erro ao atualizar status", { description: err.message }),
  });

  const statusInfo = statusConfig[order.status] ?? statusConfig.pendente;
  const payment = paymentLabels[order.paymentMethod] ?? { label: order.paymentMethod, icon: <CreditCard className="w-4 h-4" /> };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${order.address}${order.neighborhood ? ", " + order.neighborhood : ""}`
  )}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
    `${order.address}${order.neighborhood ? ", " + order.neighborhood : ""}`
  )}`;

  const canConfirmPickup = order.status === "em_preparo" || order.status === "confirmado";
  const canConfirmDelivery = order.status === "saiu_entrega";
  const isDelivered = order.status === "entregue";

  return (
    <div
      className="rounded-3xl overflow-hidden shadow-sm transition-all"
      style={{
        background: WHITE,
        border: `2px solid ${isDelivered ? GREEN : order.status === "saiu_entrega" ? PURPLE : BORDER}`,
        opacity: isDelivered ? 0.75 : 1,
      }}
    >
      {/* Card Header */}
      <div
        className="px-5 pt-5 pb-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                className="font-black text-lg"
                style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
              >
                Pedido #{order.id}
              </span>
              <span
                className="text-xs font-black px-2.5 py-1 rounded-full"
                style={{ background: statusInfo.bg, color: statusInfo.color }}
              >
                {statusInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GRAY }} />
              <span className="font-bold text-sm truncate" style={{ color: DARK }}>
                {order.customerName}
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: PURPLE }} />
              <span className="font-semibold text-sm leading-tight" style={{ color: GRAY }}>
                {order.address}
                {order.neighborhood ? ` — ${order.neighborhood}` : ""}
                {order.complement ? ` (${order.complement})` : ""}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span
              className="font-black text-xl"
              style={{ color: PURPLE, fontFamily: "Nunito, sans-serif" }}
            >
              {formatCurrency(order.totalAmount)}
            </span>
            <div className="flex items-center gap-1" style={{ color: GRAY }}>
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{formatTime(order.createdAt)}</span>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5" style={{ color: GRAY }} />
            ) : (
              <ChevronDown className="w-5 h-5" style={{ color: GRAY }} />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4" style={{ borderTop: `1.5px solid ${BORDER}` }}>
          {/* Itens do pedido */}
          <div className="pt-4">
            <p className="font-black text-sm mb-2" style={{ color: DARK }}>
              Itens do Pedido
            </p>
            <div className="space-y-1.5">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-2">
                  <span className="font-semibold text-sm" style={{ color: DARK }}>
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-bold text-sm" style={{ color: GRAY }}>
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
              <div
                className="flex justify-between items-center gap-2 pt-1.5 mt-1.5"
                style={{ borderTop: `1px dashed ${BORDER}` }}
              >
                <span className="font-bold text-sm" style={{ color: GRAY }}>
                  Taxa de entrega
                </span>
                <span className="font-bold text-sm" style={{ color: GRAY }}>
                  {formatCurrency(order.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="font-black text-sm" style={{ color: DARK }}>
                  Total
                </span>
                <span className="font-black text-base" style={{ color: PURPLE }}>
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div
            className="flex items-center gap-3 p-3 rounded-2xl"
            style={{
              background: order.paymentMethod === "dinheiro" ? "oklch(0.97 0.06 90)" : "oklch(0.97 0.01 305)",
            }}
          >
            <div style={{ color: order.paymentMethod === "dinheiro" ? ORANGE : PURPLE }}>
              {payment.icon}
            </div>
            <div className="flex-1">
              <p className="font-black text-sm" style={{ color: DARK }}>
                {payment.label}
              </p>
              {order.paymentMethod === "dinheiro" && order.changeFor && (
                <p className="text-xs font-bold" style={{ color: ORANGE }}>
                  Troco para {formatCurrency(order.changeFor)}
                </p>
              )}
              {order.paymentMethod === "dinheiro" && !order.changeFor && (
                <p className="text-xs font-bold" style={{ color: GRAY }}>
                  Sem troco necessário
                </p>
              )}
            </div>
          </div>

          {/* Observações */}
          {order.notes && (
            <div
              className="flex items-start gap-2 p-3 rounded-2xl"
              style={{ background: "oklch(0.97 0.06 90)" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: ORANGE }} />
              <div>
                <p className="font-black text-xs mb-0.5" style={{ color: ORANGE }}>
                  Observação do cliente
                </p>
                <p className="font-semibold text-sm" style={{ color: DARK }}>
                  {order.notes}
                </p>
              </div>
            </div>
          )}

          {/* Ações de navegação */}
          <div className="grid grid-cols-2 gap-2">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="w-full font-bold rounded-2xl border-2 bg-transparent gap-2 text-sm"
                style={{ borderColor: BORDER, color: DARK }}
              >
                <Navigation className="w-4 h-4" />
                Google Maps
              </Button>
            </a>
            <a href={wazeUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="w-full font-bold rounded-2xl border-2 bg-transparent gap-2 text-sm"
                style={{ borderColor: BORDER, color: DARK }}
              >
                <Navigation className="w-4 h-4" />
                Waze
              </Button>
            </a>
          </div>

          {/* Contato com cliente */}
          {order.customerPhone && (
            <a
              href={`https://wa.me/55${order.customerPhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="w-full font-bold rounded-2xl border-2 bg-transparent gap-2 text-sm"
                style={{ borderColor: "#25D366", color: "#25D366" }}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp do Cliente
              </Button>
            </a>
          )}

          {/* Contato com a loja */}
          <a
            href={`https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(
              `Olá, sou o entregador. Estou com o Pedido #${order.id} para ${order.customerName}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="w-full font-bold rounded-2xl border-2 bg-transparent gap-2 text-sm"
              style={{ borderColor: PURPLE, color: PURPLE }}
            >
              <Phone className="w-4 h-4" />
              Contato com a Loja
            </Button>
          </a>

          {/* Ações de status */}
          {canConfirmPickup && (
            <Button
              onClick={() =>
                updateStatus.mutate({
                  orderId: order.id,
                  deliveryPersonId,
                  status: "saiu_entrega",
                })
              }
              disabled={updateStatus.isPending}
              className="w-full font-black rounded-2xl text-white gap-2"
              style={{ background: ORANGE, minHeight: 52 }}
            >
              <PackageCheck className="w-5 h-5" />
              Confirmar Retirada na Loja
            </Button>
          )}

          {canConfirmDelivery && (
            <Button
              onClick={() =>
                updateStatus.mutate({
                  orderId: order.id,
                  deliveryPersonId,
                  status: "entregue",
                })
              }
              disabled={updateStatus.isPending}
              className="w-full font-black rounded-2xl text-white gap-2"
              style={{ background: GREEN, minHeight: 52 }}
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirmar Entrega ao Cliente
            </Button>
          )}

          {isDelivered && (
            <div
              className="flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-sm"
              style={{ background: "oklch(0.95 0.05 145)", color: GREEN }}
            >
              <CheckCircle2 className="w-5 h-5" />
              Pedido entregue com sucesso!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DeliveryDashboard() {
  const { session, logout } = useDeliveryAuth();
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<"ativos" | "todos">("ativos");

  useEffect(() => {
    if (!session) navigate("/entregador/login");
  }, [session, navigate]);

  const { data: orders = [], isLoading, refetch, isFetching } = trpc.delivery.myOrders.useQuery(
    { deliveryPersonId: session?.id ?? 0 },
    {
      enabled: !!session,
      refetchInterval: 30_000, // Auto-refresh a cada 30s
    }
  );

  if (!session) return null;

  const activeOrders = orders.filter((o) => o.status !== "entregue" && o.status !== "cancelado");
  const displayOrders = filter === "ativos" ? activeOrders : orders;

  const pendingCount = orders.filter((o) =>
    ["em_preparo", "confirmado", "saiu_entrega"].includes(o.status)
  ).length;

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.97 0.01 305)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-4 shadow-sm"
        style={{ background: PURPLE }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div>
              <p
                className="font-black text-white text-base leading-tight"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {session.name}
              </p>
              <p className="text-white/70 text-xs font-semibold">Entregador</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <RefreshCw
                className={`w-4 h-4 text-white ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/entregador/login");
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Ativos", value: activeOrders.length, color: PURPLE },
            {
              label: "Saiu",
              value: orders.filter((o) => o.status === "saiu_entrega").length,
              color: ORANGE,
            },
            {
              label: "Entregues",
              value: orders.filter((o) => o.status === "entregue").length,
              color: GREEN,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-3 text-center shadow-sm"
              style={{ background: WHITE, border: `1.5px solid ${BORDER}` }}
            >
              <p
                className="font-black text-2xl leading-none"
                style={{ color: stat.color, fontFamily: "Nunito, sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="font-bold text-xs mt-1" style={{ color: GRAY }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div
          className="flex rounded-2xl p-1 gap-1"
          style={{ background: WHITE, border: `1.5px solid ${BORDER}` }}
        >
          {(["ativos", "todos"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all capitalize"
              style={
                filter === f
                  ? { background: PURPLE, color: WHITE }
                  : { background: "transparent", color: GRAY }
              }
            >
              {f === "ativos" ? `Ativos (${activeOrders.length})` : `Todos (${orders.length})`}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: PURPLE }} />
            <p className="font-bold text-sm" style={{ color: GRAY }}>
              Carregando pedidos...
            </p>
          </div>
        ) : displayOrders.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-4 rounded-3xl"
            style={{ background: WHITE, border: `1.5px solid ${BORDER}` }}
          >
            <ShoppingBag className="w-12 h-12" style={{ color: BORDER }} />
            <div className="text-center">
              <p className="font-black text-base" style={{ color: DARK }}>
                {filter === "ativos" ? "Nenhum pedido ativo" : "Nenhum pedido ainda"}
              </p>
              <p className="font-semibold text-sm mt-1" style={{ color: GRAY }}>
                {filter === "ativos"
                  ? "Aguarde a loja atribuir pedidos para você."
                  : "Seus pedidos aparecerão aqui."}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-xl"
              style={{ background: "oklch(0.95 0.03 305)", color: PURPLE }}
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order as Order}
                deliveryPersonId={session.id}
              />
            ))}
          </div>
        )}

        {/* Auto-refresh notice */}
        <p className="text-center text-xs font-semibold pb-4" style={{ color: GRAY }}>
          Atualização automática a cada 30 segundos
        </p>
      </div>
    </div>
  );
}
