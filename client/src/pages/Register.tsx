import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { User, Phone, Mail, MapPin, Calendar, ChevronLeft, CheckCircle, ShoppingBag } from "lucide-react";

const PURPLE = "oklch(0.38 0.22 305)";
const PURPLE_LIGHT = "oklch(0.96 0.03 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return value;
}

export default function Register() {
  const [, navigate] = useLocation();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    neighborhood: "",
    complement: "",
    birthDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = trpc.customers.register.useMutation({
    onSuccess: () => {
      setSuccess(true);
      toast.success("Cadastro realizado com sucesso!", {
        description: "Bem-vindo ao Recanto do Açaí!",
      });
    },
    onError: (err) => {
      if (err.message.includes("telefone")) {
        setErrors((prev) => ({ ...prev, phone: err.message }));
      } else {
        toast.error("Erro ao cadastrar", { description: err.message });
      }
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) newErrors.name = "Nome deve ter ao menos 2 caracteres";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10) newErrors.phone = "Telefone inválido (mínimo 10 dígitos)";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "E-mail inválido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    registerMutation.mutate({
      name: form.name.trim(),
      phone: form.phone.replace(/\D/g, ""),
      email: form.email || undefined,
      address: form.address || undefined,
      neighborhood: form.neighborhood || undefined,
      complement: form.complement || undefined,
      birthDate: form.birthDate || undefined,
    });
  };

  const inputClass = (field: string) =>
    `w-full px-4 rounded-2xl font-semibold text-base transition-all outline-none border-2 ${
      errors[field] ? "border-red-400" : "border-transparent focus:border-purple-400"
    }`;

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: PURPLE_LIGHT }}>
        <div className="w-full max-w-sm text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ background: PURPLE }}
          >
            <CheckCircle className="w-12 h-12" style={{ color: GOLD }} />
          </div>
          <h1 className="font-black text-3xl mb-2" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
            Cadastro realizado!
          </h1>
          <p className="font-semibold mb-8" style={{ color: GRAY }}>
            Bem-vindo ao Recanto do Açaí, {form.name.split(" ")[0]}! Agora você pode fazer seus pedidos com facilidade.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
            style={{ background: PURPLE, color: WHITE }}
          >
            <ShoppingBag className="w-5 h-5" />
            Ver Cardápio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: PURPLE_LIGHT }}>
      {/* Header */}
      <header className="sticky top-0 z-10 shadow-sm" style={{ background: PURPLE }}>
        <div className="container flex items-center gap-3" style={{ minHeight: 64 }}>
          <Link href="/">
            <button
              className="flex items-center justify-center rounded-full transition-all hover:opacity-80 active:scale-95"
              style={{ minWidth: 44, minHeight: 44, color: WHITE }}
              aria-label="Voltar"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </Link>
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: GOLD }}>
            <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-black text-base" style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}>
            Criar Conta
          </h1>
        </div>
      </header>

      <div className="container py-6 pb-12">
        {/* Hero */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full overflow-hidden border-4 mx-auto mb-4 shadow-lg"
            style={{ borderColor: PURPLE }}
          >
            <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
          </div>
          <h2 className="font-black text-2xl mb-1" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
            Cadastre-se grátis
          </h2>
          <p className="text-sm font-semibold" style={{ color: GRAY }}>
            Salve seu endereço e faça pedidos mais rápido
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">

          {/* Nome */}
          <div>
            <label className="block text-sm font-black mb-1.5 px-1" style={{ color: DARK }}>
              Nome completo *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: PURPLE }} />
              <input
                type="text"
                placeholder="Seu nome completo"
                value={form.name}
                onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }}
                className={inputClass("name")}
                style={{ background: WHITE, color: DARK, paddingLeft: 48, height: 52 }}
                autoComplete="name"
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 font-semibold mt-1 px-1">{errors.name}</p>}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-black mb-1.5 px-1" style={{ color: DARK }}>
              WhatsApp / Telefone *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: PURPLE }} />
              <input
                type="tel"
                placeholder="(21) 99999-9999"
                value={form.phone}
                onChange={(e) => { setForm((f) => ({ ...f, phone: formatPhone(e.target.value) })); setErrors((er) => ({ ...er, phone: "" })); }}
                className={inputClass("phone")}
                style={{ background: WHITE, color: DARK, paddingLeft: 48, height: 52 }}
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 font-semibold mt-1 px-1">{errors.phone}</p>}
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-sm font-black mb-1.5 px-1" style={{ color: DARK }}>
              E-mail <span className="font-semibold opacity-60">(opcional)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: PURPLE }} />
              <input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((er) => ({ ...er, email: "" })); }}
                className={inputClass("email")}
                style={{ background: WHITE, color: DARK, paddingLeft: 48, height: 52 }}
                autoComplete="email"
                inputMode="email"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 font-semibold mt-1 px-1">{errors.email}</p>}
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-black mb-1.5 px-1" style={{ color: DARK }}>
              Endereço <span className="font-semibold opacity-60">(opcional)</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: PURPLE }} />
              <input
                type="text"
                placeholder="Rua, número"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className={inputClass("address")}
                style={{ background: WHITE, color: DARK, paddingLeft: 48, height: 52 }}
                autoComplete="street-address"
              />
            </div>
          </div>

          {/* Bairro + Complemento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-black mb-1.5 px-1" style={{ color: DARK }}>Bairro</label>
              <input
                type="text"
                placeholder="Bairro"
                value={form.neighborhood}
                onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))}
                className={inputClass("neighborhood")}
                style={{ background: WHITE, color: DARK, paddingLeft: 16, height: 52 }}
              />
            </div>
            <div>
              <label className="block text-sm font-black mb-1.5 px-1" style={{ color: DARK }}>Complemento</label>
              <input
                type="text"
                placeholder="Apto, bloco..."
                value={form.complement}
                onChange={(e) => setForm((f) => ({ ...f, complement: e.target.value }))}
                className={inputClass("complement")}
                style={{ background: WHITE, color: DARK, paddingLeft: 16, height: 52 }}
              />
            </div>
          </div>

          {/* Data de nascimento */}
          <div>
            <label className="block text-sm font-black mb-1.5 px-1" style={{ color: DARK }}>
              Data de nascimento <span className="font-semibold opacity-60">(opcional)</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: PURPLE }} />
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                className={inputClass("birthDate")}
                style={{ background: WHITE, color: DARK, paddingLeft: 48, height: 52 }}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ background: PURPLE, color: WHITE }}
            >
              {registerMutation.isPending ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Criar minha conta
                </>
              )}
            </button>
          </div>

          {/* Link para cardápio */}
          <p className="text-center text-sm font-semibold" style={{ color: GRAY }}>
            Já quer pedir sem cadastro?{" "}
            <Link href="/">
              <span className="font-black underline underline-offset-2 cursor-pointer" style={{ color: PURPLE }}>
                Ver cardápio
              </span>
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
