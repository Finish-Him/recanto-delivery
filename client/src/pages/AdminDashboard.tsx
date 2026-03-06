import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  Clock,
  ChefHat,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MapPin,
  Phone,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

type OrderStatus =
  | "pendente"
  | "confirmado"
  | "em_preparo"
  | "saiu_entrega"
  | "entregue"
  | "cancelado";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pendente: {
    label: "Pendente",
    color: "oklch(0.12 0 0)",
    bg: "oklch(0.93 0.12 90)",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  confirmado: {
    label: "Confirmado",
    color: "oklch(0.99 0 0)",
    bg: "oklch(0.55 0.18 200)",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  em_preparo: {
    label: "Em Preparo",
    color: "oklch(0.99 0 0)",
    bg: "oklch(0.55 0.18 300)",
    icon: <ChefHat className="w-3.5 h-3.5" />,
  },
  saiu_entrega: {
    label: "Saiu p/ Entrega",
    color: "oklch(0.99 0 0)",
    bg: "oklch(0.52 0.19 25)",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  entregue: {
    label: "Entregue",
    color: "oklch(0.99 0 0)",
    bg: "oklch(0.45 0.18 145)",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  cancelado: {
    label: "Cancelado",
    color: "oklch(0.99 0 0)",
    bg: "oklch(0.52 0.22 25)",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const paymentLabels: Record<string, string> = {
  dinheiro: "💵 Dinheiro",
  pix: "📱 PIX",
  cartao_debito: "💳 Débito",
  cartao_credito: "💳 Crédito",
  cartao_online: "🌐 Online (Stripe)",
};

const statusOptions: OrderStatus[] = [
  "pendente",
  "confirmado",
  "em_preparo",
  "saiu_entrega",
  "entregue",
  "cancelado",
];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "todos">("todos");

  const {
    data: orders,
    isLoading,
    refetch,
    isFetching,
  } = trpc.orders.list.useQuery(undefined, {
    refetchInterval: 15000, // auto-refresh a cada 15s
  });

  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
    },
    onError: () => toast.error("Erro ao atualizar status."),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.94 0.04 55)" }}>
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-t-transparent" style={{ borderColor: "oklch(0.52 0.19 25)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "oklch(0.94 0.04 55)" }}>
        <ShoppingBag className="w-16 h-16" style={{ color: "oklch(0.52 0.19 25)" }} />
        <h2 className="font-black text-2xl uppercase" style={{ fontFamily: "Syne, sans-serif", color: "oklch(0.12 0 0)" }}>
          Acesso Restrito
        </h2>
        <p className="font-semibold" style={{ color: "oklch(0.45 0.02 55)" }}>
          Faça login para acessar o painel administrativo.
        </p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="font-bold uppercase"
          style={{ background: "oklch(0.52 0.19 25)", color: "white" }}
        >
          Fazer Login
        </Button>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "oklch(0.94 0.04 55)" }}>
        <XCircle className="w-16 h-16" style={{ color: "oklch(0.52 0.22 25)" }} />
        <h2 className="font-black text-2xl uppercase" style={{ fontFamily: "Syne, sans-serif", color: "oklch(0.12 0 0)" }}>
          Sem Permissão
        </h2>
        <p className="font-semibold" style={{ color: "oklch(0.45 0.02 55)" }}>
          Você não tem acesso ao painel administrativo.
        </p>
      </div>
    );
  }

  const filteredOrders =
    filterStatus === "todos"
      ? orders
      : orders?.filter((o) => o.status === filterStatus);

  const pendingCount = orders?.filter((o) => o.status === "pendente").length ?? 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="font-black uppercase text-2xl sm:text-3xl"
              style={{ fontFamily: "Syne, sans-serif", color: "oklch(0.12 0 0)" }}
            >
              Painel de Pedidos
            </h1>
            <p className="font-semibold text-sm mt-1" style={{ color: "oklch(0.45 0.02 55)" }}>
              Recanto do Açaí — Atualiza automaticamente a cada 15s
            </p>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm animate-pulse"
                style={{ background: "oklch(0.93 0.12 90)", color: "oklch(0.12 0 0)" }}
              >
                <Clock className="w-4 h-4" />
                {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
              </div>
            )}
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="font-bold gap-2"
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statusOptions.map((status) => {
            const count = orders?.filter((o) => o.status === status).length ?? 0;
            const cfg = statusConfig[status];
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(filterStatus === status ? "todos" : status)}
                className="rounded-xl p-3 text-center transition-all hover:scale-105"
                style={{
                  background: filterStatus === status ? cfg.bg : "oklch(0.99 0 0)",
                  border: `2px solid ${filterStatus === status ? cfg.bg : "oklch(0.80 0.05 55)"}`,
                  color: filterStatus === status ? cfg.color : "oklch(0.12 0 0)",
                }}
              >
                <div className="font-black text-2xl">{count}</div>
                <div className="font-bold text-xs uppercase mt-0.5">{cfg.label}</div>
              </button>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm" style={{ color: "oklch(0.45 0.02 55)" }}>
            Filtrar:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("todos")}
              className="px-3 py-1 rounded-full text-xs font-bold transition-all"
              style={{
                background: filterStatus === "todos" ? "oklch(0.12 0 0)" : "oklch(0.99 0 0)",
                color: filterStatus === "todos" ? "oklch(0.99 0 0)" : "oklch(0.12 0 0)",
                border: "2px solid oklch(0.80 0.05 55)",
              }}
            >
              Todos
            </button>
            {statusOptions.map((s) => {
              const cfg = statusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1"
                  style={{
                    background: filterStatus === s ? cfg.bg : "oklch(0.99 0 0)",
                    color: filterStatus === s ? cfg.color : "oklch(0.12 0 0)",
                    border: `2px solid ${filterStatus === s ? cfg.bg : "oklch(0.80 0.05 55)"}`,
                  }}
                >
                  {cfg.icon}
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-2xl p-5 animate-pulse"
                style={{ background: "oklch(0.99 0 0)", border: "2px solid oklch(0.80 0.05 55)" }}
              >
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-8 bg-gray-200 rounded w-full mt-4" />
              </div>
            ))}
          </div>
        ) : filteredOrders?.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: "oklch(0.99 0 0)", border: "2px solid oklch(0.80 0.05 55)" }}
          >
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: "oklch(0.80 0.05 55)" }} />
            <p className="font-bold text-lg" style={{ color: "oklch(0.45 0.02 55)" }}>
              Nenhum pedido encontrado
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders?.map((order) => {
              const cfg = statusConfig[order.status as OrderStatus];
              return (
                <div
                  key={order.id}
                  className="rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-md"
                  style={{
                    background: "oklch(0.99 0 0)",
                    border: `2px solid ${order.status === "pendente" ? "oklch(0.93 0.12 90)" : "oklch(0.80 0.05 55)"}`,
                  }}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span
                        className="font-black text-lg"
                        style={{ color: "oklch(0.12 0 0)", fontFamily: "Syne, sans-serif" }}
                      >
                        #{order.id}
                      </span>
                      <p className="font-bold text-sm" style={{ color: "oklch(0.12 0 0)" }}>
                        {order.customerName}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </div>
                  </div>

                  {/* Contact & address */}
                  <div className="space-y-1.5 mb-3">
                    {order.customerPhone && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "oklch(0.45 0.02 55)" }}>
                        <Phone className="w-3.5 h-3.5" />
                        {order.customerPhone}
                      </div>
                    )}
                    <div className="flex items-start gap-1.5 text-xs font-semibold" style={{ color: "oklch(0.45 0.02 55)" }}>
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>
                        {order.address}
                        {order.neighborhood ? `, ${order.neighborhood}` : ""}
                        {order.complement ? ` — ${order.complement}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "oklch(0.45 0.02 55)" }}>
                      <CreditCard className="w-3.5 h-3.5" />
                      {paymentLabels[order.paymentMethod] || order.paymentMethod}
                    </div>
                  </div>

                  {/* Items */}
                  <div
                    className="rounded-xl p-3 mb-3 space-y-1"
                    style={{ background: "oklch(0.94 0.04 55)" }}
                  >
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs font-semibold" style={{ color: "oklch(0.12 0 0)" }}>
                        <span>{item.quantity}x {item.productName}</span>
                        <span>R$ {parseFloat(item.subtotal).toFixed(2).replace(".", ",")}</span>
                      </div>
                    ))}
                    <div
                      className="border-t pt-1 mt-1 flex justify-between font-black text-sm"
                      style={{ borderColor: "oklch(0.80 0.05 55)", color: "oklch(0.52 0.19 25)" }}
                    >
                      <span>Total</span>
                      <span>R$ {parseFloat(order.totalAmount).toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>

                  {order.notes && (
                    <p className="text-xs font-semibold mb-3 italic" style={{ color: "oklch(0.45 0.02 55)" }}>
                      📝 {order.notes}
                    </p>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs mb-3" style={{ color: "oklch(0.60 0.02 55)" }}>
                    {new Date(order.createdAt).toLocaleString("pt-BR")}
                  </p>

                  {/* Status update */}
                  <Select
                    value={order.status}
                    onValueChange={(val) =>
                      updateStatus.mutate({ id: order.id, status: val as OrderStatus })
                    }
                  >
                    <SelectTrigger
                      className="w-full font-bold text-sm"
                      style={{ borderColor: "oklch(0.80 0.05 55)" }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s} className="font-semibold">
                          {statusConfig[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
