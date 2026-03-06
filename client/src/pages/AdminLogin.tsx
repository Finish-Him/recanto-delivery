import { useState } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogIn, ShieldCheck, Eye, EyeOff } from "lucide-react";

const PURPLE = "oklch(0.38 0.22 305)";
const PURPLE_DARK = "oklch(0.28 0.22 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";
const BG = "oklch(0.97 0.01 305)";
const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";

// Credenciais de acesso rápido para testes
const TEST_USER = "admin";
const TEST_PASS = "admin";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username !== TEST_USER || password !== TEST_PASS) {
      toast.error("Usuário ou senha incorretos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/dev/login-as-admin", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Login realizado com sucesso!");
        setTimeout(() => navigate("/admin"), 600);
      } else {
        toast.error("Falha no login: " + data.error);
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: BG }}
    >
      {/* Decoração de fundo */}
      <div
        className="absolute top-0 left-0 right-0 h-48 rounded-b-[3rem]"
        style={{ background: PURPLE }}
      />
      <div
        className="absolute top-32 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 overflow-hidden z-10"
        style={{ borderColor: GOLD, background: WHITE }}
      >
        <img
          src={LOGO_URL}
          alt="Recanto do Açaí"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Card de login */}
      <div
        className="relative z-10 w-full max-w-sm mt-16 rounded-3xl shadow-2xl p-8"
        style={{ background: WHITE, border: `1.5px solid ${BORDER}` }}
      >
        <div className="text-center mb-6">
          <h1
            className="font-black text-2xl mb-1"
            style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
          >
            Painel Admin
          </h1>
          <p className="text-sm font-semibold" style={{ color: GRAY }}>
            Recanto do Açaí
          </p>
        </div>

        {/* Formulário de login rápido */}
        <form onSubmit={handleTestLogin} className="space-y-4 mb-6">
          <div>
            <label
              className="block text-xs font-bold mb-1.5 uppercase tracking-wide"
              style={{ color: GRAY }}
            >
              Usuário
            </label>
            <Input
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border-2 font-semibold h-12"
              style={{ borderColor: BORDER, color: DARK }}
              autoComplete="username"
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold mb-1.5 uppercase tracking-wide"
              style={{ color: GRAY }}
            >
              Senha
            </label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-2 font-semibold h-12 pr-12"
                style={{ borderColor: BORDER, color: DARK }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg"
                style={{ color: GRAY }}
              >
                {showPass ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-black text-base shadow-lg transition-all hover:opacity-90 active:scale-[0.98] flex items-center gap-2 justify-center"
            style={{ background: PURPLE, color: WHITE }}
          >
            {loading ? (
              <div
                className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{ borderColor: WHITE, borderTopColor: "transparent" }}
              />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar
              </>
            )}
          </Button>
        </form>

        {/* Divisor */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: BORDER }} />
          <span className="text-xs font-bold" style={{ color: GRAY }}>
            ou
          </span>
          <div className="flex-1 h-px" style={{ background: BORDER }} />
        </div>

        {/* Login OAuth Manus */}
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          variant="outline"
          className="w-full h-12 rounded-xl font-black text-sm border-2 flex items-center gap-2 justify-center"
          style={{ borderColor: PURPLE, color: PURPLE }}
        >
          <ShieldCheck className="w-5 h-5" />
          Entrar com conta Manus
        </Button>

        <p className="text-center text-xs mt-4" style={{ color: GRAY }}>
          Acesso restrito ao administrador do estabelecimento
        </p>
      </div>

      {/* Link de volta ao cardápio */}
      <button
        onClick={() => navigate("/")}
        className="mt-6 text-sm font-bold underline underline-offset-2 z-10"
        style={{ color: WHITE }}
      >
        ← Voltar ao cardápio
      </button>
    </div>
  );
}
