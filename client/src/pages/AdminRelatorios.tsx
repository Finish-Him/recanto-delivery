import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, ShoppingBag, Wallet, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PURPLE = "oklch(0.38 0.22 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";

const CHART_COLORS = [
  "#6B21A8",
  "#EAB308",
  "#0EA5E9",
  "#10B981",
  "#F97316",
  "#EC4899",
];

const paymentLabels: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao_debito: "Débito",
  cartao_credito: "Crédito",
  cartao_online: "Online",
};

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

type PeriodOption = { label: string; days: number };
const periodOptions: PeriodOption[] = [
  { label: "7 dias", days: 7 },
  { label: "15 dias", days: 15 },
  { label: "30 dias", days: 30 },
];

function MetricCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 shadow-sm flex flex-col gap-3"
      style={{ background: WHITE, border: `1.5px solid ${BORDER}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accent ?? PURPLE }}
        >
          {icon}
        </div>
        <p className="font-bold text-sm" style={{ color: GRAY }}>
          {label}
        </p>
      </div>
      <p
        className="font-black text-3xl leading-none"
        style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs font-semibold" style={{ color: GRAY }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AdminRelatorios() {
  const [days, setDays] = useState(30);

  const { data: summary, isLoading: loadingSummary } = trpc.reports.summary.useQuery();
  const { data: byDay = [], isLoading: loadingByDay } = trpc.reports.byDay.useQuery({ days });
  const { data: byPayment = [], isLoading: loadingByPayment } = trpc.reports.byPayment.useQuery();

  const isLoading = loadingSummary || loadingByDay || loadingByPayment;

  // Fill missing days with 0
  const filledByDay = (() => {
    const map = new Map(byDay.map((d) => [d.date, d]));
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      result.push(map.get(key) ?? { date: key, count: 0, revenue: 0 });
    }
    return result;
  })();

  const paymentChartData = byPayment.map((p) => ({
    name: paymentLabels[p.method] ?? p.method,
    value: p.count,
    revenue: p.revenue,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: PURPLE }}
          >
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="font-black text-2xl leading-tight"
              style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
            >
              Relatórios
            </h1>
            <p className="text-sm font-semibold" style={{ color: GRAY }}>
              Visão geral de vendas e pedidos
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: PURPLE }} />
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={<ShoppingBag className="w-5 h-5 text-white" />}
                label="Total de Pedidos"
                value={String(summary?.totalOrders ?? 0)}
                sub="Todos os tempos"
                accent={PURPLE}
              />
              <MetricCard
                icon={<Wallet className="w-5 h-5 text-white" />}
                label="Faturamento Total"
                value={formatCurrency(summary?.totalRevenue ?? 0)}
                sub="Todos os tempos"
                accent="oklch(0.55 0.18 145)"
              />
              <MetricCard
                icon={<TrendingUp className="w-5 h-5 text-white" />}
                label="Ticket Médio"
                value={formatCurrency(summary?.avgTicket ?? 0)}
                sub="Por pedido"
                accent={`oklch(0.55 0.18 200)`}
              />
              <MetricCard
                icon={<Clock className="w-5 h-5 text-white" />}
                label="Pedidos Pendentes"
                value={String(summary?.pendingOrders ?? 0)}
                sub="Aguardando confirmação"
                accent={`oklch(0.65 0.19 90)`}
              />
            </div>

            {/* Pedidos por dia */}
            <div
              className="rounded-2xl p-5 shadow-sm"
              style={{ background: WHITE, border: `1.5px solid ${BORDER}` }}
            >
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <h2
                  className="font-black text-lg"
                  style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
                >
                  Pedidos por Dia
                </h2>
                <div className="flex gap-2">
                  {periodOptions.map((opt) => (
                    <Button
                      key={opt.days}
                      size="sm"
                      variant={days === opt.days ? "default" : "outline"}
                      onClick={() => setDays(opt.days)}
                      className={`font-bold rounded-lg text-xs ${days === opt.days ? "text-white" : "bg-transparent border-2"}`}
                      style={
                        days === opt.days
                          ? { background: PURPLE, borderColor: PURPLE }
                          : { borderColor: BORDER, color: GRAY }
                      }
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
              {filledByDay.every((d) => d.count === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <BarChart3 className="w-10 h-10" style={{ color: BORDER }} />
                  <p className="font-bold text-sm" style={{ color: GRAY }}>
                    Nenhum pedido nos últimos {days} dias
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={filledByDay} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      tick={{ fontSize: 11, fontWeight: 700, fill: GRAY }}
                      axisLine={false}
                      tickLine={false}
                      interval={days > 15 ? 4 : 1}
                    />
                    <YAxis
                      yAxisId="count"
                      orientation="left"
                      tick={{ fontSize: 11, fontWeight: 700, fill: GRAY }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      yAxisId="revenue"
                      orientation="right"
                      tickFormatter={(v) => `R$${v}`}
                      tick={{ fontSize: 11, fontWeight: 700, fill: GRAY }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "Pedidos") return [value, "Pedidos"];
                        return [formatCurrency(Number(value)), "Faturamento"];
                      }}
                      labelFormatter={(label) => {
                        const [year, month, day] = String(label).split("-");
                        return `${day}/${month}/${year}`;
                      }}
                      contentStyle={{
                        borderRadius: 12,
                        border: `1.5px solid ${BORDER}`,
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingTop: 12 }}
                    />
                    <Bar
                      yAxisId="count"
                      dataKey="count"
                      name="Pedidos"
                      fill={PURPLE}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      yAxisId="revenue"
                      dataKey="revenue"
                      name="Faturamento"
                      fill={GOLD}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Distribuição por forma de pagamento */}
            <div
              className="rounded-2xl p-5 shadow-sm"
              style={{ background: WHITE, border: `1.5px solid ${BORDER}` }}
            >
              <h2
                className="font-black text-lg mb-5"
                style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
              >
                Formas de Pagamento
              </h2>
              {paymentChartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <BarChart3 className="w-10 h-10" style={{ color: BORDER }} />
                  <p className="font-bold text-sm" style={{ color: GRAY }}>
                    Nenhum dado disponível
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={paymentChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {paymentChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          `${value} pedido${Number(value) !== 1 ? "s" : ""}`,
                          name,
                        ]}
                        contentStyle={{
                          borderRadius: 12,
                          border: `1.5px solid ${BORDER}`,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, fontWeight: 700 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Tabela de pagamentos */}
                  <div className="space-y-2">
                    {paymentChartData.map((item, index) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl"
                        style={{ background: "oklch(0.97 0.01 305)" }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="font-bold text-sm" style={{ color: DARK }}>
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm" style={{ color: PURPLE }}>
                            {item.value} pedido{item.value !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs font-semibold" style={{ color: GRAY }}>
                            {formatCurrency(item.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
