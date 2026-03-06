import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Clock, ChefHat, Truck, XCircle, ShoppingBag, MapPin, CreditCard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const PURPLE = "oklch(0.38 0.22 305)";
const PURPLE_LIGHT = "oklch(0.94 0.04 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.55 0.04 305)";
const BORDER = "oklch(0.90 0.04 305)";
const BG = "oklch(0.97 0.01 305)";
const GREEN = "oklch(0.52 0.18 145)";
const RED = "oklch(0.52 0.22 25)";
const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";

type OrderStatus =
  | "pendente"
  | "confirmado"
  | "em_preparo"
  | "saiu_entrega"
  | "entregue"
  | "cancelado";

const STEPS: { key: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    key: "pendente",
    label: "Pedido Recebido",
    icon: <Clock className="w-5 h-5" />,
    desc: "Aguardando confirmação do estabelecimento",
  },
  {
    key: "confirmado",
    label: "Confirmado",
    icon: <CheckCircle2 className="w-5 h-5" />,
    desc: "Seu pedido foi aceito!",
  },
  {
    key: "em_preparo",
    label: "Em Preparo",
    icon: <ChefHat className="w-5 h-5" />,
    desc: "Estamos preparando seu açaí com carinho",
  },
  {
    key: "saiu_entrega",
    label: "Saiu para Entrega",
    icon: <Truck className="w-5 h-5" />,
    desc: "O motoboy está a caminho!",
  },
  {
    key: "entregue",
    label: "Entregue",
    icon: <CheckCircle2 className="w-5 h-5" />,
    desc: "Pedido entregue. Bom apetite! 🍇",
  },
];

const STATUS_ORDER: OrderStatus[] = [
  "pendente",
  "confirmado",
  "em_preparo",
  "saiu_entrega",
  "entregue",
];

const paymentLabels: Record<string, string> = {
  dinheiro: "💵 Dinheiro",
  pix: "📱 PIX",
  cartao_debito: "💳 Débito",
  cartao_credito: "💳 Crédito",
  cartao_online: "🌐 Online (Stripe)",
};

function getStepIndex(status: OrderStatus): number {
  return STATUS_ORDER.indexOf(status);
}

export default function OrderTracking() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const orderId = parseInt(params.id ?? "0", 10);

  const { data: order, isLoading, error } = trpc.orders.track.useQuery(
    { id: orderId },
    {
      enabled: orderId > 0,
      refetchInterval: 10000, // atualiza a cada 10 segundos
      retry: 1,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="text-center space-y-4">
          <div
            className="w-12 h-12 rounded-full border-4 animate-spin mx-auto"
            style={{ borderColor: PURPLE, borderTopColor: "transparent" }}
          />
          <p className="font-bold text-sm" style={{ color: GRAY }}>
            Buscando seu pedido...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-5 px-4"
        style={{ background: BG }}
      >
        <XCircle className="w-16 h-16" style={{ color: RED }} />
        <h2 className="font-black text-2xl text-center" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
          Pedido não encontrado
        </h2>
        <p className="text-sm text-center font-semibold" style={{ color: GRAY }}>
          O número do pedido #{orderId} não existe ou ainda não foi registrado.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="font-black px-8 rounded-2xl h-12"
          style={{ background: PURPLE, color: WHITE }}
        >
          Voltar ao Cardápio
        </Button>
      </div>
    );
  }

  const isCancelled = order.status === "cancelado";
  const currentStepIndex = isCancelled ? -1 : getStepIndex(order.status as OrderStatus);
  const isDelivered = order.status === "entregue";

  const subtotal = (parseFloat(order.totalAmount) - parseFloat(order.deliveryFee ?? "4.90")).toFixed(2);

  return (
    <div className="min-h-screen animate-page-enter" style={{ background: BG }}>
      {/* Header roxo */}
      <div
        className="px-4 pt-10 pb-16 text-center relative"
        style={{ background: PURPLE }}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: GOLD }}>
            <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
          </div>
          <span className="font-black text-lg" style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}>
            Recanto do Açaí
          </span>
        </div>
        <h1 className="font-black text-3xl" style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}>
          Pedido #{order.id}
        </h1>
        <p className="text-sm font-semibold mt-1" style={{ color: "oklch(0.85 0.06 305)" }}>
          Olá, {order.customerName}! Acompanhe seu pedido abaixo.
        </p>
        {/* Badge de status atual */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm"
          style={{
            background: isCancelled ? RED : isDelivered ? GREEN : GOLD,
            color: isCancelled || isDelivered ? WHITE : DARK,
          }}
        >
          {isCancelled ? <XCircle className="w-4 h-4" /> : isDelivered ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          {isCancelled ? "Cancelado" : isDelivered ? "Entregue!" : STEPS[currentStepIndex]?.label ?? order.status}
        </div>
        <p className="text-xs mt-2" style={{ color: "oklch(0.80 0.04 305)" }}>
          Atualiza automaticamente a cada 10 segundos
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-8 pb-10 space-y-4">
        {/* Card de timeline */}
        <div
          className="rounded-3xl shadow-lg p-6"
          style={{ background: WHITE, border: `1.5px solid ${BORDER}` }}
        >
          <h2 className="font-black text-base mb-5" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
            Status do Pedido
          </h2>

          {isCancelled ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "oklch(0.97 0.02 25)" }}>
              <XCircle className="w-8 h-8 flex-shrink-0" style={{ color: RED }} />
              <div>
                <p className="font-black text-sm" style={{ color: RED }}>Pedido Cancelado</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: GRAY }}>
                  Entre em contato pelo WhatsApp para mais informações.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {STEPS.map((step, idx) => {
                const isDone = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isLast = idx === STEPS.length - 1;

                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Linha vertical + ícone */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
                        style={{
                          background: isDone ? PURPLE : BORDER,
                          color: isDone ? WHITE : GRAY,
                          boxShadow: isCurrent ? `0 0 0 4px ${PURPLE_LIGHT}` : "none",
                        }}
                      >
                        {step.icon}
                      </div>
                      {!isLast && (
                        <div
                          className="w-0.5 flex-1 my-1 min-h-[24px] transition-all duration-500"
                          style={{ background: idx < currentStepIndex ? PURPLE : BORDER }}
                        />
                      )}
                    </div>
                    {/* Texto */}
                    <div className="pb-5 pt-1">
                      <p
                        className="font-black text-sm leading-tight"
                        style={{ color: isDone ? DARK : GRAY, fontFamily: "Nunito, sans-serif" }}
                      >
                        {step.label}
                        {isCurrent && (
                          <span
                            className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: PURPLE_LIGHT, color: PURPLE }}
                          >
                            Agora
                          </span>
                        )}
                      </p>
                      {isCurrent && (
                        <p className="text-xs font-semibold mt-0.5" style={{ color: GRAY }}>
                          {step.desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Card de resumo do pedido */}
        <div
          className="rounded-3xl shadow-lg p-6"
          style={{ background: WHITE, border: `1.5px solid ${BORDER}` }}
        >
          <h2 className="font-black text-base mb-4 flex items-center gap-2" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
            <Package className="w-5 h-5" style={{ color: PURPLE }} />
            Resumo do Pedido
          </h2>
          <div className="space-y-2 mb-4">
            {order.items?.map((item: { productName: string; quantity: number; subtotal: string }, idx: number) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm font-semibold" style={{ color: DARK }}>
                  {item.quantity}x {item.productName}
                </span>
                <span className="text-sm font-bold" style={{ color: PURPLE }}>
                  R$ {parseFloat(item.subtotal).toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-3 space-y-1.5" style={{ borderTop: `1px solid ${BORDER}` }}>
            <div className="flex justify-between text-sm font-semibold" style={{ color: GRAY }}>
              <span>Subtotal</span>
              <span>R$ {parseFloat(subtotal).toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold" style={{ color: GRAY }}>
              <span>Frete</span>
              <span>R$ {parseFloat(order.deliveryFee ?? "4.90").toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between font-black text-base pt-1" style={{ color: DARK }}>
              <span>Total</span>
              <span style={{ color: PURPLE }}>R$ {parseFloat(order.totalAmount).toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>

        {/* Card de pagamento */}
        <div
          className="rounded-3xl shadow-lg p-5 flex items-center gap-4"
          style={{ background: WHITE, border: `1.5px solid ${BORDER}` }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: PURPLE_LIGHT }}
          >
            <CreditCard className="w-5 h-5" style={{ color: PURPLE }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: GRAY }}>
              Forma de Pagamento
            </p>
            <p className="font-black text-sm mt-0.5" style={{ color: DARK }}>
              {paymentLabels[order.paymentMethod] ?? order.paymentMethod}
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3 pt-2">
          <a
            href="https://wa.me/5521981749450"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl font-black text-sm transition-all hover:opacity-90"
            style={{ background: "#25D366", color: WHITE }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Falar com o Recanto
          </a>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full h-12 rounded-2xl font-black text-sm border-2"
            style={{ borderColor: PURPLE, color: PURPLE }}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Fazer Novo Pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
