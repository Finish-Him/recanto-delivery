import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useDeliveryAuth } from "@/contexts/DeliveryAuthContext";
import { useLocation } from "wouter";
import { Loader2, Bike, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const PURPLE = "oklch(0.38 0.22 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";

const PIN_LENGTH = 4;

export default function DeliveryLogin() {
  const { session, login } = useDeliveryAuth();
  const [, navigate] = useLocation();
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loginMutation = trpc.delivery.login.useMutation({
    onSuccess: (data) => {
      login(data);
      toast.success(`Bem-vindo, ${data.name}!`);
      navigate("/entregador/dashboard");
    },
    onError: (err) => {
      toast.error("PIN inválido", { description: err.message });
      setPin(Array(PIN_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (session) navigate("/entregador/dashboard");
  }, [session, navigate]);

  const handleDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (digit && index === PIN_LENGTH - 1) {
      const fullPin = [...newPin].join("");
      if (fullPin.length === PIN_LENGTH) {
        loginMutation.mutate({ pin: fullPin });
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (pasted.length === PIN_LENGTH) {
      const newPin = pasted.split("");
      setPin(newPin);
      loginMutation.mutate({ pin: pasted });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "oklch(0.97 0.01 305)" }}
    >
      {/* Back to home */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center gap-2 font-bold text-sm rounded-xl px-3 py-2 transition-colors hover:bg-white/60"
        style={{ color: GRAY }}
      >
        <ArrowLeft className="w-4 h-4" />
        Cardápio
      </button>

      <div
        className="w-full max-w-sm rounded-3xl shadow-xl overflow-hidden"
        style={{ background: WHITE }}
      >
        {/* Header roxo */}
        <div
          className="px-8 pt-10 pb-8 flex flex-col items-center gap-4"
          style={{ background: PURPLE }}
        >
          <div
            className="rounded-full overflow-hidden border-4 shadow-lg"
            style={{ borderColor: GOLD, width: 80, height: 80 }}
          >
            <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <h1
              className="font-black text-2xl text-white"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              Área do Entregador
            </h1>
            <p className="text-white/70 font-semibold text-sm mt-1">
              Recanto do Açaí
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Bike className="w-5 h-5 text-white" />
            <span className="font-bold text-white text-sm">Acesso exclusivo para entregadores</span>
          </div>
        </div>

        {/* PIN Form */}
        <div className="px-8 py-8 flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="font-black text-lg" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
              Digite seu PIN
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: GRAY }}>
              Código de {PIN_LENGTH} dígitos fornecido pela loja
            </p>
          </div>

          {/* PIN inputs */}
          <div className="flex gap-3" onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigit(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0}
                className="text-center font-black text-2xl rounded-2xl border-2 outline-none transition-all"
                style={{
                  width: 64,
                  height: 72,
                  borderColor: digit ? PURPLE : BORDER,
                  background: digit ? "oklch(0.96 0.01 305)" : WHITE,
                  color: DARK,
                  fontFamily: "Nunito, sans-serif",
                  boxShadow: digit ? `0 0 0 3px oklch(0.38 0.22 305 / 0.15)` : "none",
                }}
              />
            ))}
          </div>

          {loginMutation.isPending && (
            <div className="flex items-center gap-2" style={{ color: PURPLE }}>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-bold text-sm">Verificando PIN...</span>
            </div>
          )}

          {loginMutation.isError && (
            <div
              className="w-full text-center px-4 py-3 rounded-2xl font-bold text-sm"
              style={{ background: "oklch(0.97 0.05 25)", color: "oklch(0.52 0.22 25)" }}
            >
              PIN incorreto. Verifique com a loja.
            </div>
          )}

          <Button
            onClick={() => {
              const fullPin = pin.join("");
              if (fullPin.length < PIN_LENGTH) {
                toast.error("Digite todos os dígitos do PIN.");
                return;
              }
              loginMutation.mutate({ pin: fullPin });
            }}
            disabled={loginMutation.isPending || pin.join("").length < PIN_LENGTH}
            className="w-full font-black rounded-2xl text-white text-base"
            style={{ background: PURPLE, minHeight: 52 }}
          >
            {loginMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</>
            ) : (
              "Entrar"
            )}
          </Button>

          <p className="text-xs font-semibold text-center" style={{ color: GRAY }}>
            Não tem PIN? Entre em contato com a loja pelo{" "}
            <a
              href="https://wa.me/5521981749450"
              target="_blank"
              rel="noopener noreferrer"
              className="font-black underline"
              style={{ color: PURPLE }}
            >
              WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
