import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
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

const PURPLE = "oklch(0.38 0.22 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";

type OrderStatus = "pendente" | "confirmado" | "em_preparo" | "saiu_entrega" | "entregue" | "cancelado";

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pendente:     { label: "Pendente",       color: DARK,  bg: GOLD,                          icon: <Clock className="w-3.5 h-3.5" /> },
  confirmado:   { label: "Confirmado",     color: WHITE, bg: "oklch(0.55 0.18 200)",         icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  em_preparo:   { label: "Em Preparo",     color: WHITE, bg: "oklch(0.55 0.18 300)",         icon: <ChefHat className="w-3.5 h-3.5" /> },
  saiu_entrega: { label: "Saiu p/ Entrega",color: WHITE, bg: PURPLE,                        icon: <Truck className="w-3.5 h-3.5" /> },
  entregue:     { label: "Entregue",       color: WHITE, bg: "oklch(0.45 0.18 145)",         icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelado:    { label: "Cancelado",      color: WHITE, bg: "oklch(0.52 0.22 25)",          icon: <XCircle className="w-3.5 h-3.5" /> },
};

const paymentLabels: Record<string, string> = {
  dinheiro: "💵 Dinheiro",
  pix: "📱 PIX",
  cartao_debito: "💳 Débito",
  cartao_credito: "💳 Crédito",
  cartao_online: "🌐 Online (Stripe)",
};

const statusOptions: OrderStatus[] = ["pendente", "confirmado", "em_preparo", "saiu_entrega", "entregue", "cancelado"];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "todos">("todos");

  const { data: orders, isLoading, refetch, isFetching } = trpc.orders.list.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status atualizado!"); refetch(); },
    onError: () => toast.error("Erro ao atualizar status."),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: WHITE }}>
        <div
          className="w-10 h-10 rounded-full border-4 animate-spin"
          style={{ borderColor: PURPLE, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: WHITE }}>
        <div className="w-24 h-24 rounded-full overflow-hidden border-4" style={{ borderColor: PURPLE }}>
          <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
        </div>
        <h2 className="font-black text-2xl" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
          Acesso Restrito
        </h2>
        <p className="font-semibold" style={{ color: GRAY }}>
          Faça login para acessar o painel administrativo.
        </p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="font-black px-8"
          style={{ background: PURPLE, color: WHITE }}
        >
          Fazer Login
        </Button>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: WHITE }}>
        <XCircle className="w-16 h-16" style={{ color: "oklch(0.52 0.22 25)" }} />
        <h2 className="font-black text-2xl" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
          Sem Permissão
        </h2>
        <p className="font-semibold" style={{ color: GRAY }}>
          Você não tem acesso ao painel administrativo.
        </p>
      </div>
    );
  }

  const filteredOrders = filterStatus === "todos" ? orders : orders?.filter((o) => o.status === filterStatus);
  const pendingCount = orders?.filter((o) => o.status === "pendente").length ?? 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2" style={{ borderColor: PURPLE }}>
              <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-black text-2xl sm:text-3xl" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
                Painel de Pedidos
              </h1>
              <p className="font-semibold text-sm" style={{ color: GRAY }}>
                Recanto do Açaí · Atualiza a cada 15s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm animate-pulse"
                style={{ background: GOLD, color: DARK }}
              >
                <Clock className="w-4 h-4" />
                {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
              </div>
            )}
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="font-bold gap-2 rounded-xl border-2"
              style={{ borderColor: BORDER, color: DARK }}
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
            const selected = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(filterStatus === status ? "todos" : status)}
                className="rounded-2xl p-3 text-center transition-all hover:scale-105 border-2"
                style={{
                  background: selected ? cfg.bg : WHITE,
                  borderColor: selected ? cfg.bg : BORDER,
                  color: selected ? cfg.color : DARK,
                }}
              >
                <div className="font-black text-2xl">{count}</div>
                <div className="font-bold text-xs uppercase mt-0.5">{cfg.label}</div>
              </button>
            );
          })}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-sm" style={{ color: GRAY }}>Filtrar:</span>
          <button
            onClick={() => setFilterStatus("todos")}
            className="px-3 py-1 rounded-full text-xs font-black transition-all border-2"
            style={{
              background: filterStatus === "todos" ? PURPLE : WHITE,
              color: filterStatus === "todos" ? WHITE : DARK,
              borderColor: filterStatus === "todos" ? PURPLE : BORDER,
            }}
          >
            Todos
          </button>
          {statusOptions.map((s) => {
            const cfg = statusConfig[s];
            const selected = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 border-2"
                style={{
                  background: selected ? cfg.bg : WHITE,
                  color: selected ? cfg.color : DARK,
                  borderColor: selected ? cfg.bg : BORDER,
                }}
              >
                {cfg.icon}
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Orders grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-2xl p-5 animate-pulse border-2" style={{ background: WHITE, borderColor: BORDER }}>
                <div className="h-5 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-8 bg-gray-100 rounded w-full mt-4" />
              </div>
            ))}
          </div>
        ) : filteredOrders?.length === 0 ? (
          <div className="rounded-2xl p-12 text-center border-2" style={{ background: WHITE, borderColor: BORDER }}>
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: BORDER }} />
            <p className="font-bold text-lg" style={{ color: GRAY }}>
              Nenhum pedido encontrado
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders?.map((order) => {
              const cfg = statusConfig[order.status as OrderStatus];
              const isPending = order.status === "pendente";
              return (
                <div
                  key={order.id}
                  className="rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-md border-2"
                  style={{
                    background: WHITE,
                    borderColor: isPending ? GOLD : BORDER,
                  }}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-black text-xl" style={{ color: PURPLE, fontFamily: "Nunito, sans-serif" }}>
                        #{order.id}
                      </span>
                      <p className="font-black text-sm" style={{ color: DARK }}>
                        {order.customerName}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </div>
                  </div>

                  {/* Contact & address */}
                  <div className="space-y-1.5 mb-3">
                    {order.customerPhone && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: GRAY }}>
                        <Phone className="w-3.5 h-3.5" />
                        {order.customerPhone}
                      </div>
                    )}
                    <div className="flex items-start gap-1.5 text-xs font-semibold" style={{ color: GRAY }}>
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>
                        {order.address}
                        {order.neighborhood ? `, ${order.neighborhood}` : ""}
                        {order.complement ? ` — ${order.complement}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: GRAY }}>
                      <CreditCard className="w-3.5 h-3.5" />
                      {paymentLabels[order.paymentMethod] || order.paymentMethod}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="rounded-xl p-3 mb-3 space-y-1" style={{ background: "oklch(0.96 0.01 305)" }}>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs font-semibold" style={{ color: DARK }}>
                        <span>{item.quantity}× {item.productName}</span>
                        <span>R$ {parseFloat(item.subtotal).toFixed(2).replace(".", ",")}</span>
                      </div>
                    ))}
                    <div
                      className="border-t pt-1 mt-1 flex justify-between font-black text-sm"
                      style={{ borderColor: BORDER, color: PURPLE }}
                    >
                      <span>Total</span>
                      <span>R$ {parseFloat(order.totalAmount).toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>

                  {order.notes && (
                    <p className="text-xs font-semibold mb-3 italic" style={{ color: GRAY }}>
                      📝 {order.notes}
                    </p>
                  )}

                  <p className="text-xs mb-3" style={{ color: "oklch(0.65 0.02 305)" }}>
                    {new Date(order.createdAt).toLocaleString("pt-BR")}
                  </p>

                  {/* Status select */}
                  <Select
                    value={order.status}
                    onValueChange={(val) => updateStatus.mutate({ id: order.id, status: val as OrderStatus })}
                  >
                    <SelectTrigger
                      className="w-full font-bold text-sm rounded-xl border-2"
                      style={{ borderColor: BORDER }}
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
