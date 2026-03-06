import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { MemphisShapes } from "@/components/MemphisShapes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShoppingBag, CreditCard, Banknote, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

type PaymentMethod = "dinheiro" | "pix" | "cartao_debito" | "cartao_credito" | "cartao_online";

const paymentOptions: { value: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "dinheiro", label: "Dinheiro", icon: <Banknote className="w-5 h-5" />, description: "Pague na entrega" },
  { value: "pix", label: "PIX", icon: <QrCode className="w-5 h-5" />, description: "Pague na entrega" },
  { value: "cartao_debito", label: "Débito", icon: <CreditCard className="w-5 h-5" />, description: "Maquininha na entrega" },
  { value: "cartao_credito", label: "Crédito", icon: <CreditCard className="w-5 h-5" />, description: "Maquininha na entrega" },
  { value: "cartao_online", label: "Cartão Online", icon: <CreditCard className="w-5 h-5" />, description: "Pague agora com Stripe" },
];

function StripePaymentForm({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string;
  onSuccess: () => void;
}) {
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
        className="w-full font-bold uppercase py-6 rounded-xl text-white"
        style={{ background: "oklch(0.52 0.19 25)" }}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
        ) : (
          "Confirmar Pagamento"
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
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
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "oklch(0.94 0.04 55)" }}
      >
        <ShoppingBag className="w-16 h-16" style={{ color: "oklch(0.52 0.19 25)" }} />
        <p className="font-black text-xl uppercase" style={{ color: "oklch(0.12 0 0)", fontFamily: "Syne, sans-serif" }}>
          Carrinho vazio!
        </p>
        <Button
          onClick={() => navigate("/")}
          style={{ background: "oklch(0.52 0.19 25)", color: "white" }}
          className="font-bold uppercase"
        >
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
        totalAmount: totalAmount.toFixed(2),
        notes: form.notes || undefined,
        items: orderItems,
      });

      setOrderId(result.orderId);

      if (form.paymentMethod === "cartao_online") {
        const amountInCents = Math.round(totalAmount * 100);
        const pi = await createPaymentIntent.mutateAsync({
          amount: amountInCents,
          orderId: result.orderId,
          customerName: form.customerName,
        });
        setClientSecret(pi.clientSecret!);
        setStep("stripe-payment");
      } else {
        clearCart();
        setStep("done");
      }
    } catch (err) {
      toast.error("Erro ao realizar pedido. Tente novamente.");
    }
  };

  if (step === "done") {
    return (
      <div
        className="min-h-screen relative flex flex-col items-center justify-center gap-6 px-4"
        style={{ background: "oklch(0.94 0.04 55)" }}
      >
        <MemphisShapes />
        <div className="relative z-10 text-center max-w-md">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg"
            style={{ background: "oklch(0.88 0.07 160)" }}
          >
            ✅
          </div>
          <h2
            className="font-display font-black uppercase text-3xl sm:text-4xl mb-3"
            style={{ color: "oklch(0.12 0 0)", textShadow: "3px 3px 0px rgba(0,0,0,0.08)" }}
          >
            Pedido Realizado!
          </h2>
          <p className="font-semibold text-base mb-2" style={{ color: "oklch(0.35 0.02 55)" }}>
            Pedido #{orderId} confirmado com sucesso.
          </p>
          <p className="font-semibold text-sm mb-8" style={{ color: "oklch(0.45 0.02 55)" }}>
            Você receberá seu açaí em breve. Obrigado pela preferência! 🍇
          </p>
          <Button
            onClick={() => navigate("/")}
            className="font-bold uppercase px-8 py-4 rounded-xl text-white"
            style={{ background: "oklch(0.52 0.19 25)" }}
          >
            Fazer Novo Pedido
          </Button>
        </div>
      </div>
    );
  }

  if (step === "stripe-payment" && clientSecret) {
    return (
      <div
        className="min-h-screen relative"
        style={{ background: "oklch(0.94 0.04 55)" }}
      >
        <MemphisShapes />
        <header className="relative z-10 sticky top-0 shadow-sm" style={{ background: "oklch(0.12 0 0)" }}>
          <div className="container flex items-center h-16">
            <button
              onClick={() => setStep("form")}
              className="flex items-center gap-2 font-bold text-sm"
              style={{ color: "oklch(0.99 0 0)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <h1
              className="font-display font-black uppercase text-lg ml-4"
              style={{ color: "oklch(0.99 0 0)" }}
            >
              Pagamento Online
            </h1>
          </div>
        </header>
        <div className="relative z-10 container py-8 max-w-lg">
          <div
            className="rounded-2xl p-6 shadow-lg"
            style={{ background: "oklch(0.99 0 0)", border: "2px solid oklch(0.80 0.05 55)" }}
          >
            <p className="font-bold text-sm mb-4" style={{ color: "oklch(0.45 0.02 55)" }}>
              Total a pagar:{" "}
              <span className="font-black text-xl" style={{ color: "oklch(0.52 0.19 25)", fontFamily: "Syne, sans-serif" }}>
                R$ {totalAmount.toFixed(2).replace(".", ",")}
              </span>
            </p>
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: "stripe" } }}
            >
              <StripePaymentForm
                clientSecret={clientSecret}
                onSuccess={() => {
                  clearCart();
                  setStep("done");
                }}
              />
            </Elements>
            <p className="text-xs mt-3 text-center" style={{ color: "oklch(0.55 0.02 55)" }}>
              Teste: use o cartão 4242 4242 4242 4242
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: "oklch(0.94 0.04 55)" }}>
      <MemphisShapes />

      <header className="relative z-10 sticky top-0 shadow-sm" style={{ background: "oklch(0.12 0 0)" }}>
        <div className="container flex items-center h-16">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-bold text-sm"
            style={{ color: "oklch(0.99 0 0)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1
            className="font-display font-black uppercase text-lg ml-4"
            style={{ color: "oklch(0.99 0 0)" }}
          >
            Finalizar Pedido
          </h1>
        </div>
      </header>

      <div className="relative z-10 container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-4xl mx-auto">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            {/* Delivery info */}
            <div
              className="rounded-2xl p-6 shadow-md"
              style={{ background: "oklch(0.99 0 0)", border: "2px solid oklch(0.80 0.05 55)" }}
            >
              <h2
                className="font-display font-black uppercase text-lg mb-4"
                style={{ color: "oklch(0.12 0 0)" }}
              >
                Dados de Entrega
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="font-bold text-sm" style={{ color: "oklch(0.12 0 0)" }}>
                    Nome completo *
                  </Label>
                  <Input
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="Seu nome"
                    required
                    className="mt-1 font-semibold"
                    style={{ borderColor: "oklch(0.80 0.05 55)" }}
                  />
                </div>
                <div>
                  <Label className="font-bold text-sm" style={{ color: "oklch(0.12 0 0)" }}>
                    WhatsApp / Telefone
                  </Label>
                  <Input
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="mt-1 font-semibold"
                    style={{ borderColor: "oklch(0.80 0.05 55)" }}
                  />
                </div>
                <div>
                  <Label className="font-bold text-sm" style={{ color: "oklch(0.12 0 0)" }}>
                    Endereço (rua e número) *
                  </Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Rua das Flores, 123"
                    required
                    className="mt-1 font-semibold"
                    style={{ borderColor: "oklch(0.80 0.05 55)" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-bold text-sm" style={{ color: "oklch(0.12 0 0)" }}>
                      Bairro
                    </Label>
                    <Input
                      value={form.neighborhood}
                      onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                      placeholder="Bairro"
                      className="mt-1 font-semibold"
                      style={{ borderColor: "oklch(0.80 0.05 55)" }}
                    />
                  </div>
                  <div>
                    <Label className="font-bold text-sm" style={{ color: "oklch(0.12 0 0)" }}>
                      Complemento
                    </Label>
                    <Input
                      value={form.complement}
                      onChange={(e) => setForm({ ...form, complement: e.target.value })}
                      placeholder="Apto, bloco..."
                      className="mt-1 font-semibold"
                      style={{ borderColor: "oklch(0.80 0.05 55)" }}
                    />
                  </div>
                </div>
                <div>
                  <Label className="font-bold text-sm" style={{ color: "oklch(0.12 0 0)" }}>
                    Observações
                  </Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Sem granola, mais leite condensado..."
                    className="mt-1 font-semibold resize-none"
                    rows={2}
                    style={{ borderColor: "oklch(0.80 0.05 55)" }}
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div
              className="rounded-2xl p-6 shadow-md"
              style={{ background: "oklch(0.99 0 0)", border: "2px solid oklch(0.80 0.05 55)" }}
            >
              <h2
                className="font-display font-black uppercase text-lg mb-4"
                style={{ color: "oklch(0.12 0 0)" }}
              >
                Forma de Pagamento
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {paymentOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, paymentMethod: opt.value })}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 font-bold text-sm transition-all"
                    style={{
                      borderColor:
                        form.paymentMethod === opt.value
                          ? "oklch(0.52 0.19 25)"
                          : "oklch(0.80 0.05 55)",
                      background:
                        form.paymentMethod === opt.value
                          ? "oklch(0.96 0.04 25)"
                          : "transparent",
                      color: "oklch(0.12 0 0)",
                    }}
                  >
                    <span style={{ color: form.paymentMethod === opt.value ? "oklch(0.52 0.19 25)" : "oklch(0.45 0.02 55)" }}>
                      {opt.icon}
                    </span>
                    <span className="font-black text-xs uppercase">{opt.label}</span>
                    <span className="text-xs font-semibold text-center leading-tight" style={{ color: "oklch(0.55 0.02 55)" }}>
                      {opt.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={createOrder.isPending || createPaymentIntent.isPending}
              className="w-full font-bold uppercase py-6 rounded-xl text-white text-base shadow-lg transition-transform hover:scale-[1.02]"
              style={{ background: "oklch(0.52 0.19 25)" }}
            >
              {createOrder.isPending || createPaymentIntent.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
              ) : form.paymentMethod === "cartao_online" ? (
                "Continuar para Pagamento"
              ) : (
                "Confirmar Pedido"
              )}
            </Button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl p-6 shadow-md sticky top-24"
              style={{ background: "oklch(0.99 0 0)", border: "2px solid oklch(0.80 0.05 55)" }}
            >
              <h2
                className="font-display font-black uppercase text-lg mb-4"
                style={{ color: "oklch(0.12 0 0)" }}
              >
                Resumo do Pedido
              </h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: "oklch(0.12 0 0)" }}>
                        {item.quantity}x {item.productName}
                      </p>
                    </div>
                    <span className="font-bold text-sm whitespace-nowrap" style={{ color: "oklch(0.45 0.02 55)" }}>
                      R$ {(item.unitPrice * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="border-t pt-3 flex justify-between items-center"
                style={{ borderColor: "oklch(0.80 0.05 55)" }}
              >
                <span className="font-bold" style={{ color: "oklch(0.12 0 0)" }}>Total</span>
                <span
                  className="font-black text-2xl"
                  style={{ color: "oklch(0.52 0.19 25)", fontFamily: "Syne, sans-serif" }}
                >
                  R$ {totalAmount.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
