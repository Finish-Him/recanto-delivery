import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShoppingBag, CreditCard, Banknote, QrCode, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

// Cores da marca
const PURPLE = "oklch(0.38 0.22 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";

type PaymentMethod = "dinheiro" | "pix" | "cartao_debito" | "cartao_credito" | "cartao_online";

const paymentOptions: { value: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "dinheiro", label: "Dinheiro", icon: <Banknote className="w-5 h-5" />, description: "Na entrega" },
  { value: "pix", label: "PIX", icon: <QrCode className="w-5 h-5" />, description: "Na entrega" },
  { value: "cartao_debito", label: "Débito", icon: <CreditCard className="w-5 h-5" />, description: "Maquininha" },
  { value: "cartao_credito", label: "Crédito", icon: <CreditCard className="w-5 h-5" />, description: "Maquininha" },
  { value: "cartao_online", label: "Online", icon: <CreditCard className="w-5 h-5" />, description: "Stripe seguro" },
];

function StripePaymentForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/pedido-confirmado" },
      redirect: "if_required",
    });
    if (error) {
      toast.error("Erro no pagamento", { description: error.message });
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={loading || !stripe}
        className="w-full font-black py-6 rounded-2xl text-white"
        style={{ background: PURPLE }}
      >
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</> : "Confirmar Pagamento"}
      </Button>
    </form>
  );
}

// Shared header component
function CheckoutHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="sticky top-0 z-10 shadow-sm" style={{ background: PURPLE }}>
      <div className="container flex items-center h-16 gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-bold text-sm transition-opacity hover:opacity-80"
          style={{ color: WHITE }}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="w-px h-5 opacity-30" style={{ background: WHITE }} />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden border" style={{ borderColor: GOLD }}>
            <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-black text-base" style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}>
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}

export default function Checkout() {
  const { items, totalAmount, grandTotal, deliveryFee, clearCart } = useCart();
  const [, navigate] = useLocation();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    address: "",
    neighborhood: "",
    complement: "",
    notes: "",
    paymentMethod: "dinheiro" as PaymentMethod,
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [step, setStep] = useState<"form" | "stripe-payment" | "done">("form");

  const createOrder = trpc.orders.create.useMutation();
  const createPaymentIntent = trpc.stripe.createPaymentIntent.useMutation();

  if (items.length === 0 && step !== "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: WHITE }}>
        <div className="w-24 h-24 rounded-full overflow-hidden border-4" style={{ borderColor: PURPLE }}>
          <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
        </div>
        <p className="font-black text-xl" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
          Carrinho vazio!
        </p>
        <Button onClick={() => navigate("/")} style={{ background: PURPLE, color: WHITE }} className="font-black px-8">
          Ver Cardápio
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.address.trim()) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        subtotal: (item.unitPrice * item.quantity).toFixed(2),
      }));
      const result = await createOrder.mutateAsync({
        customerName: form.customerName,
        customerPhone: form.customerPhone || undefined,
        address: form.address,
        neighborhood: form.neighborhood || undefined,
        complement: form.complement || undefined,
        paymentMethod: form.paymentMethod,
        deliveryFee: deliveryFee.toFixed(2),
        totalAmount: grandTotal.toFixed(2),
        notes: form.notes || undefined,
        items: orderItems,
      });
      setOrderId(result.orderId);
      if (form.paymentMethod === "cartao_online") {
        const pi = await createPaymentIntent.mutateAsync({
          amount: Math.round(grandTotal * 100),
          orderId: result.orderId,
          customerName: form.customerName,
        });
        setClientSecret(pi.clientSecret!);
        setStep("stripe-payment");
      } else {
        clearCart();
        setStep("done");
      }
    } catch {
      toast.error("Erro ao realizar pedido. Tente novamente.");
    }
  };

  if (step === "done") {
    // Redirecionar automaticamente para a página de rastreamento após 3 segundos
    setTimeout(() => {
      if (orderId) navigate(`/pedido/${orderId}`);
    }, 3000);

    return (
      <div className="min-h-screen flex flex-col" style={{ background: WHITE }}>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: "oklch(0.45 0.18 145)" }}
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2
              className="font-black text-3xl sm:text-4xl mb-2"
              style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
            >
              Pedido Confirmado!
            </h2>
            <p className="font-bold text-base mb-1" style={{ color: GRAY }}>
              Pedido #{orderId} realizado com sucesso.
            </p>
            <p className="font-semibold text-sm" style={{ color: GRAY }}>
              Seu açaí está sendo preparado com carinho. 🍇
            </p>
          </div>
          <div
            className="px-6 py-4 rounded-2xl border-2 text-sm font-semibold"
            style={{ borderColor: BORDER, color: GRAY }}
          >
            Tempo estimado: <strong style={{ color: PURPLE }}>30–45 minutos</strong>
          </div>
          <p className="text-xs font-semibold" style={{ color: GRAY }}>
            Redirecionando para o rastreamento em 3 segundos...
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              onClick={() => orderId && navigate(`/pedido/${orderId}`)}
              className="font-black px-10 py-5 rounded-2xl text-white shadow-lg"
              style={{ background: PURPLE }}
            >
              Acompanhar Pedido
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="font-black px-10 py-5 rounded-2xl border-2"
              style={{ borderColor: PURPLE, color: PURPLE }}
            >
              Fazer Novo Pedido
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "stripe-payment" && clientSecret) {
    return (
      <div className="min-h-screen" style={{ background: WHITE }}>
        <CheckoutHeader title="Pagamento Online" onBack={() => setStep("form")} />
        <div className="container py-8 max-w-lg">
          <div
            className="rounded-2xl p-6 shadow-sm border"
            style={{ borderColor: BORDER }}
          >
            <p className="font-bold text-sm mb-1" style={{ color: GRAY }}>Total a pagar</p>
            <p className="font-black text-3xl mb-6" style={{ color: PURPLE, fontFamily: "Nunito, sans-serif" }}>
              R$ {grandTotal.toFixed(2).replace(".", ",")}
            </p>
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
              <StripePaymentForm clientSecret={clientSecret} onSuccess={() => { clearCart(); setStep("done"); }} />
            </Elements>
            <p className="text-xs mt-4 text-center" style={{ color: GRAY }}>
              Teste: cartão <strong>4242 4242 4242 4242</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: WHITE }}>
      <CheckoutHeader title="Finalizar Pedido" onBack={() => navigate("/")} />

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-4xl mx-auto">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            {/* Delivery */}
            <div className="rounded-2xl p-6 shadow-sm border" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-6 rounded-full" style={{ background: PURPLE }} />
                <h2 className="font-black text-lg" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
                  Dados de Entrega
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="font-bold text-sm" style={{ color: DARK }}>Nome completo *</Label>
                  <Input
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Seu nome"
                    required
                    className="mt-1 font-semibold rounded-xl"
                    style={{ borderColor: BORDER }}
                  />
                </div>
                <div>
                  <Label className="font-bold text-sm" style={{ color: DARK }}>WhatsApp / Telefone</Label>
                  <Input
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="(21) 99999-9999"
                    className="mt-1 font-semibold rounded-xl"
                    style={{ borderColor: BORDER }}
                  />
                </div>
                <div>
                  <Label className="font-bold text-sm" style={{ color: DARK }}>Endereço (rua e número) *</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Rua das Flores, 123"
                    required
                    className="mt-1 font-semibold rounded-xl"
                    style={{ borderColor: BORDER }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-bold text-sm" style={{ color: DARK }}>Bairro</Label>
                    <Input
                      value={form.neighborhood}
                      onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                      placeholder="Bairro"
                      className="mt-1 font-semibold rounded-xl"
                      style={{ borderColor: BORDER }}
                    />
                  </div>
                  <div>
                    <Label className="font-bold text-sm" style={{ color: DARK }}>Complemento</Label>
                    <Input
                      value={form.complement}
                      onChange={(e) => setForm({ ...form, complement: e.target.value })}
                      placeholder="Apto, bloco..."
                      className="mt-1 font-semibold rounded-xl"
                      style={{ borderColor: BORDER }}
                    />
                  </div>
                </div>
                <div>
                  <Label className="font-bold text-sm" style={{ color: DARK }}>Observações</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Sem granola, mais leite condensado..."
                    className="mt-1 font-semibold resize-none rounded-xl"
                    rows={2}
                    style={{ borderColor: BORDER }}
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-2xl p-6 shadow-sm border" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-6 rounded-full" style={{ background: PURPLE }} />
                <h2 className="font-black text-lg" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
                  Forma de Pagamento
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {paymentOptions.map((opt) => {
                  const selected = form.paymentMethod === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, paymentMethod: opt.value })}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 font-bold text-sm transition-all"
                      style={{
                        borderColor: selected ? PURPLE : BORDER,
                        background: selected ? "oklch(0.96 0.01 305)" : WHITE,
                        color: DARK,
                      }}
                    >
                      <span style={{ color: selected ? PURPLE : GRAY }}>{opt.icon}</span>
                      <span className="font-black text-xs uppercase">{opt.label}</span>
                      <span className="text-xs font-semibold text-center leading-tight" style={{ color: GRAY }}>
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              disabled={createOrder.isPending || createPaymentIntent.isPending}
              className="w-full font-black py-6 rounded-2xl text-white text-base shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: PURPLE }}
            >
              {createOrder.isPending || createPaymentIntent.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
              ) : form.paymentMethod === "cartao_online" ? (
                "Continuar para Pagamento →"
              ) : (
                "Confirmar Pedido →"
              )}
            </Button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl shadow-sm border sticky top-24 overflow-hidden" style={{ borderColor: BORDER }}>
              {/* Summary header */}
              <div className="px-5 py-4" style={{ background: PURPLE }}>
                <h2 className="font-black text-base" style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}>
                  Resumo do Pedido
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: DARK }}>
                          {item.quantity}× {item.productName}
                        </p>
                        <p className="text-xs font-semibold" style={{ color: GRAY }}>
                          R$ {item.unitPrice.toFixed(2).replace(".", ",")} cada
                        </p>
                      </div>
                      <span className="font-bold text-sm whitespace-nowrap" style={{ color: GRAY }}>
                        R$ {(item.unitPrice * item.quantity).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 space-y-2" style={{ borderColor: BORDER }}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm" style={{ color: GRAY }}>Subtotal</span>
                    <span className="font-semibold text-sm" style={{ color: GRAY }}>R$ {totalAmount.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm" style={{ color: GRAY }}>Taxa de entrega</span>
                    <span className="font-semibold text-sm" style={{ color: GRAY }}>R$ {deliveryFee.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t" style={{ borderColor: BORDER }}>
                    <span className="font-black" style={{ color: DARK }}>Total</span>
                    <span className="font-black text-2xl" style={{ color: PURPLE, fontFamily: "Nunito, sans-serif" }}>
                      R$ {grandTotal.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
