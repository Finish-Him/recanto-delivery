import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Bike,
  UserX,
  Search,
  TrendingUp,
  Wallet,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

const PURPLE      = "oklch(0.38 0.22 305)";
const PURPLE_SOFT = "oklch(0.94 0.04 305)";
const GOLD        = "oklch(0.77 0.19 90)";
const GOLD_SOFT   = "oklch(0.97 0.04 90)";
const WHITE       = "oklch(0.99 0 0)";
const DARK        = "oklch(0.12 0 0)";
const GRAY        = "oklch(0.45 0.03 305)";
const BORDER      = "oklch(0.88 0.04 305)";
const LOGO_URL    = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/logo-recanto-app-BiGZ2DoJqLYmsEJWh6h9pU.webp";

type OrderStatus = "pendente" | "confirmado" | "em_preparo" | "saiu_entrega" | "entregue" | "cancelado";

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pendente:     { label: "Pendente",        color: DARK,  bg: GOLD,                          icon: <Clock className="w-3.5 h-3.5" /> },
  confirmado:   { label: "Confirmado",      color: WHITE, bg: "oklch(0.55 0.18 200)",         icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  em_preparo:   { label: "Em Preparo",      color: WHITE, bg: "oklch(0.55 0.18 300)",         icon: <ChefHat className="w-3.5 h-3.5" /> },
  saiu_entrega: { label: "Saiu p/ Entrega", color: WHITE, bg: PURPLE,                        icon: <Truck className="w-3.5 h-3.5" /> },
  entregue:     { label: "Entregue",        color: WHITE, bg: "oklch(0.45 0.18 145)",         icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelado:    { label: "Cancelado",       color: WHITE, bg: "oklch(0.52 0.22 25)",          icon: <XCircle className="w-3.5 h-3.5" /> },
};

const paymentLabels: Record<string, string> = {
  dinheiro:       "💵 Dinheiro",
  pix:            "📱 PIX",
  cartao_debito:  "💳 Débito",
  cartao_credito: "💳 Crédito",
  cartao_online:  "🌐 Online",
};

const statusOptions: OrderStatus[] = ["pendente", "confirmado", "em_preparo", "saiu_entrega", "entregue", "cancelado"];

// ─── Quick-action buttons ────────────────────────────────────────────────────
const QUICK_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  pendente:     "confirmado",
  confirmado:   "em_preparo",
  em_preparo:   "saiu_entrega",
  saiu_entrega: "entregue",
};
const QUICK_LABELS: Partial<Record<OrderStatus, string>> = {
  pendente:     "✅ Confirmar",
  confirmado:   "👨‍🍳 Iniciar Preparo",
  em_preparo:   "🛵 Saiu p/ Entrega",
  saiu_entrega: "🏠 Marcar Entregue",
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [filterStatus, setFilterStatus]   = useState<OrderStatus | "todos">("todos");
  const [filterDelivery, setFilterDelivery] = useState<string>("todos");
  const [searchQuery, setSearchQuery]     = useState("");

  const { data: orders, isLoading, refetch, isFetching } = trpc.orders.list.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const utils = trpc.useUtils();

  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status atualizado!"); refetch(); },
    onError:   () => toast.error("Erro ao atualizar status."),
  });

  const assignDelivery = trpc.delivery.assignOrder.useMutation({
    onMutate: async ({ orderId, deliveryPersonId }) => {
      await utils.orders.list.cancel();
      const prev = utils.orders.list.getData();
      utils.orders.list.setData(undefined, (old) =>
        old?.map((o) =>
          o.id === orderId
            ? {
                ...o,
                deliveryPersonId,
                deliveryPersonName:
                  deliveryPersonId === null
                    ? null
                    : (deliveryPersons?.find((p) => p.id === deliveryPersonId)?.name ?? null),
              }
            : o
        )
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.orders.list.setData(undefined, ctx.prev);
      toast.error("Erro ao atribuir entregador.");
    },
    onSettled: () => utils.orders.list.invalidate(),
    onSuccess: (_data, vars) => {
      if (vars.deliveryPersonId === null) {
        toast.success("Entregador removido do pedido.");
      } else {
        const name = deliveryPersons?.find((p) => p.id === vars.deliveryPersonId)?.name;
        toast.success(`Pedido atribuído a ${name ?? "entregador"}.`);
      }
    },
  });

  const { data: deliveryPersons } = trpc.delivery.list.useQuery();

  // ─── Métricas ───────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    if (!orders) return { today: 0, revenue: 0, avgTicket: 0, active: 0 };
    const now = new Date();
    const todayOrders = orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const delivered = orders.filter((o) => o.status === "entregue");
    const revenue = delivered.reduce((s, o) => s + parseFloat(o.totalAmount), 0);
    const active = orders.filter((o) => !["entregue", "cancelado"].includes(o.status)).length;
    return {
      today: todayOrders.length,
      revenue,
      avgTicket: delivered.length ? revenue / delivered.length : 0,
      active,
    };
  }, [orders]);

  // ─── Filtros combinados ──────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      if (filterStatus !== "todos" && o.status !== filterStatus) return false;
      if (filterDelivery === "sem_entregador" && (o as any).deliveryPersonId) return false;
      if (filterDelivery !== "todos" && filterDelivery !== "sem_entregador") {
        if (String((o as any).deliveryPersonId) !== filterDelivery) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          o.customerName?.toLowerCase().includes(q) ||
          o.address?.toLowerCase().includes(q) ||
          o.customerPhone?.toLowerCase().includes(q) ||
          String(o.id).includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [orders, filterStatus, filterDelivery, searchQuery]);

  const pendingCount = orders?.filter((o) => o.status === "pendente").length ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: WHITE }}>
        <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: PURPLE, borderTopColor: "transparent" }} />
      </div>
    );
  }

  const handleDevLogin = async () => {
    try {
      const res = await fetch("/api/dev/login-as-admin", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (data.success) {
        toast.success("Login de teste realizado! Recarregando...");
        setTimeout(() => window.location.reload(), 800);
      } else {
        toast.error("Falha no login de teste: " + data.error);
      }
    } catch {
      toast.error("Erro ao fazer login de teste.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: WHITE }}>
        <div className="w-24 h-24 rounded-full overflow-hidden border-4" style={{ borderColor: PURPLE }}>
          <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
        </div>
        <h2 className="font-black text-2xl" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>Acesso Restrito</h2>
        <p className="font-semibold" style={{ color: GRAY }}>Faça login para acessar o painel administrativo.</p>
        <Button onClick={() => (window.location.href = getLoginUrl())} className="font-black px-8" style={{ background: PURPLE, color: WHITE }}>
          Fazer Login com Manus
        </Button>
        <div className="mt-2 p-4 rounded-2xl border-2 border-dashed text-center" style={{ borderColor: GOLD, background: GOLD_SOFT }}>
          <p className="font-bold text-sm mb-2" style={{ color: DARK }}>Modo de Teste</p>
          <p className="text-xs mb-3" style={{ color: GRAY }}>Acesso direto ao painel sem login OAuth</p>
          <Button onClick={handleDevLogin} variant="outline" className="font-black px-6 border-2" style={{ borderColor: GOLD, color: DARK }}>
            Entrar como Admin (Teste)
          </Button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: WHITE }}>
        <XCircle className="w-16 h-16" style={{ color: "oklch(0.52 0.22 25)" }} />
        <h2 className="font-black text-2xl" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>Sem Permissão</h2>
        <p className="font-semibold" style={{ color: GRAY }}>Você não tem acesso ao painel administrativo.</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0" style={{ borderColor: PURPLE }}>
              <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-black text-2xl sm:text-3xl leading-none" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
                Painel de Pedidos
              </h1>
              <p className="font-semibold text-xs mt-0.5" style={{ color: GRAY }}>
                Recanto do Açaí · atualiza a cada 15s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm animate-pulse" style={{ background: GOLD, color: DARK }}>
                <AlertCircle className="w-4 h-4" />
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

        {/* ── Métricas do dia ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Pedidos Hoje",    value: metrics.today,                                icon: <ShoppingBag className="w-5 h-5" />, color: PURPLE,                       bg: PURPLE_SOFT },
            { label: "Ativos Agora",    value: metrics.active,                               icon: <TrendingUp className="w-5 h-5" />,  color: "oklch(0.55 0.18 200)",        bg: "oklch(0.94 0.04 200)" },
            { label: "Faturamento",     value: `R$ ${metrics.revenue.toFixed(2).replace(".", ",")}`, icon: <Wallet className="w-5 h-5" />, color: "oklch(0.45 0.18 145)", bg: "oklch(0.94 0.05 145)" },
            { label: "Ticket Médio",    value: `R$ ${metrics.avgTicket.toFixed(2).replace(".", ",")}`, icon: <CreditCard className="w-5 h-5" />, color: GOLD,              bg: GOLD_SOFT },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl p-4 border-2" style={{ background: m.bg, borderColor: "transparent" }}>
              <div className="flex items-center gap-2 mb-1" style={{ color: m.color }}>
                {m.icon}
                <span className="text-xs font-black uppercase tracking-wide">{m.label}</span>
              </div>
              <div className="font-black text-xl" style={{ color: DARK }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* ── Status counters (clicáveis) ── */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {statusOptions.map((status) => {
            const count = orders?.filter((o) => o.status === status).length ?? 0;
            const cfg   = statusConfig[status];
            const selected = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(filterStatus === status ? "todos" : status)}
                className="rounded-2xl p-3 text-center transition-all hover:scale-105 border-2 focus:outline-none"
                style={{
                  background:   selected ? cfg.bg : WHITE,
                  borderColor:  selected ? cfg.bg : BORDER,
                  color:        selected ? cfg.color : DARK,
                }}
              >
                <div className="font-black text-2xl">{count}</div>
                <div className="font-bold text-[10px] uppercase mt-0.5 leading-tight">{cfg.label}</div>
              </button>
            );
          })}
        </div>

        {/* ── Filtros e busca ── */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: GRAY }} />
            <Input
              placeholder="Buscar por nome, endereço, telefone ou #ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 font-semibold rounded-xl border-2"
              style={{ borderColor: BORDER }}
            />
          </div>

          {/* Filtro por status */}
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as OrderStatus | "todos")}>
            <SelectTrigger className="w-full sm:w-44 font-bold rounded-xl border-2" style={{ borderColor: BORDER }}>
              <Filter className="w-4 h-4 mr-1" style={{ color: GRAY }} />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos" className="font-semibold">Todos os status</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s} className="font-semibold">{statusConfig[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por entregador */}
          <Select value={filterDelivery} onValueChange={setFilterDelivery}>
            <SelectTrigger className="w-full sm:w-48 font-bold rounded-xl border-2" style={{ borderColor: BORDER }}>
              <Bike className="w-4 h-4 mr-1" style={{ color: GRAY }} />
              <SelectValue placeholder="Entregador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos" className="font-semibold">Todos entregadores</SelectItem>
              <SelectItem value="sem_entregador" className="font-semibold">Sem entregador</SelectItem>
              {deliveryPersons?.filter((p) => p.active).map((p) => (
                <SelectItem key={p.id} value={String(p.id)} className="font-semibold">{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Resultado da busca ── */}
        {(searchQuery || filterStatus !== "todos" || filterDelivery !== "todos") && (
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: GRAY }}>
              {filteredOrders.length} pedido{filteredOrders.length !== 1 ? "s" : ""} encontrado{filteredOrders.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => { setSearchQuery(""); setFilterStatus("todos"); setFilterDelivery("todos"); }}
              className="text-xs font-black underline"
              style={{ color: PURPLE }}
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* ── Grid de pedidos ── */}
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
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-2xl p-12 text-center border-2" style={{ background: WHITE, borderColor: BORDER }}>
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: BORDER }} />
            <p className="font-bold text-lg" style={{ color: GRAY }}>Nenhum pedido encontrado</p>
            {(searchQuery || filterStatus !== "todos" || filterDelivery !== "todos") && (
              <p className="text-sm mt-1" style={{ color: GRAY }}>Tente ajustar os filtros acima.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const cfg       = statusConfig[order.status as OrderStatus];
              const isPending = order.status === "pendente";
              const nextStatus = QUICK_TRANSITIONS[order.status as OrderStatus];
              const quickLabel = QUICK_LABELS[order.status as OrderStatus];

              return (
                <div
                  key={order.id}
                  className="rounded-2xl shadow-sm transition-shadow hover:shadow-md border-2 flex flex-col"
                  style={{
                    background:   WHITE,
                    borderColor:  isPending ? GOLD : BORDER,
                  }}
                >
                  {/* Card header */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-black text-xl" style={{ color: PURPLE, fontFamily: "Nunito, sans-serif" }}>
                          #{order.id}
                        </span>
                        <p className="font-black text-sm leading-tight" style={{ color: DARK }}>{order.customerName}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "oklch(0.65 0.02 305)" }}>
                          {new Date(order.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.icon}
                        {cfg.label}
                      </div>
                    </div>

                    {/* Contact & address */}
                    <div className="space-y-1 mb-3">
                      {order.customerPhone && (
                        <a
                          href={`https://wa.me/55${order.customerPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
                          style={{ color: "oklch(0.45 0.18 145)" }}
                        >
                          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                          {order.customerPhone}
                        </a>
                      )}
                      <div className="flex items-start gap-1.5 text-xs font-semibold" style={{ color: GRAY }}>
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(`${order.address}${order.neighborhood ? `, ${order.neighborhood}` : ""}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                          style={{ color: GRAY }}
                        >
                          {order.address}{order.neighborhood ? `, ${order.neighborhood}` : ""}
                          {order.complement ? ` — ${order.complement}` : ""}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: GRAY }}>
                        <CreditCard className="w-3.5 h-3.5" />
                        {paymentLabels[order.paymentMethod] || order.paymentMethod}
                        {(order as any).changeFor && (
                          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black" style={{ background: GOLD_SOFT, color: DARK }}>
                            Troco p/ R$ {parseFloat((order as any).changeFor).toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="rounded-xl p-3 mb-2 space-y-2" style={{ background: "oklch(0.96 0.01 305)" }}>
                      {order.items.map((item) => {
                        const addons = item.addonsJson ? (() => { try { return JSON.parse(item.addonsJson as string) as Array<{addonName: string; price: number}>; } catch { return []; } })() : [];
                        return (
                          <div key={item.id} className="space-y-0.5">
                            <div className="flex justify-between text-xs font-semibold" style={{ color: DARK }}>
                              <span>{item.quantity}× {item.productName}</span>
                              <span>R$ {parseFloat(item.subtotal).toFixed(2).replace(".", ",")}</span>
                            </div>
                            {addons.length > 0 && (
                              <div className="pl-3 space-y-0.5">
                                {addons.map((addon, idx) => (
                                  <div key={idx} className="flex justify-between text-xs" style={{ color: "oklch(0.45 0.03 305)" }}>
                                    <span>└ {addon.addonName}</span>
                                    {addon.price > 0 && <span>+R$ {addon.price.toFixed(2).replace(".", ",")}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                            {item.notes && (
                              <p className="pl-3 text-xs italic" style={{ color: "oklch(0.55 0.12 90)" }}>
                                📝 {item.notes}
                              </p>
                            )}
                          </div>
                        );
                      })}
                      <div className="border-t pt-1 mt-1 flex justify-between font-black text-sm" style={{ borderColor: BORDER, color: PURPLE }}>
                        <span>Total</span>
                        <span>R$ {parseFloat(order.totalAmount).toFixed(2).replace(".", ",")}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <p className="text-xs font-semibold mb-2 italic rounded-lg px-2 py-1.5" style={{ color: DARK, background: GOLD_SOFT }}>
                        📝 {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Card footer: entregador + status + ação rápida */}
                  <div className="px-4 pb-4 mt-auto space-y-2">
                    {/* Entregador */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Bike className="w-3.5 h-3.5" style={{ color: PURPLE }} />
                        <span className="text-xs font-black" style={{ color: DARK }}>Entregador</span>
                        {(order as any).deliveryPersonId && (
                          <span className="ml-auto text-xs font-black px-2 py-0.5 rounded-full" style={{ background: PURPLE_SOFT, color: PURPLE }}>
                            {(order as any).deliveryPersonName ?? "Atribuído"}
                          </span>
                        )}
                      </div>
                      <Select
                        value={String((order as any).deliveryPersonId ?? "none")}
                        onValueChange={(val) =>
                          assignDelivery.mutate({ orderId: order.id, deliveryPersonId: val === "none" ? null : Number(val) })
                        }
                      >
                        <SelectTrigger
                          className="w-full font-bold text-sm rounded-xl border-2"
                          style={{
                            borderColor: (order as any).deliveryPersonId ? PURPLE : BORDER,
                            background:  (order as any).deliveryPersonId ? PURPLE_SOFT : WHITE,
                          }}
                        >
                          <SelectValue placeholder="Sem entregador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="font-semibold">
                            <span className="flex items-center gap-2"><UserX className="w-3.5 h-3.5" />Sem entregador</span>
                          </SelectItem>
                          {deliveryPersons?.filter((p) => p.active).map((p) => (
                            <SelectItem key={p.id} value={String(p.id)} className="font-semibold">
                              <span className="flex items-center gap-2"><Bike className="w-3.5 h-3.5" />{p.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status select */}
                    <Select
                      value={order.status}
                      onValueChange={(val) => updateStatus.mutate({ id: order.id, status: val as OrderStatus })}
                    >
                      <SelectTrigger className="w-full font-bold text-sm rounded-xl border-2" style={{ borderColor: BORDER }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s} value={s} className="font-semibold">{statusConfig[s].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Ação rápida */}
                    {nextStatus && quickLabel && (
                      <Button
                        onClick={() => updateStatus.mutate({ id: order.id, status: nextStatus })}
                        disabled={updateStatus.isPending}
                        className="w-full font-black rounded-xl"
                        style={{ background: statusConfig[nextStatus].bg, color: statusConfig[nextStatus].color }}
                      >
                        {quickLabel}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
