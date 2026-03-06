import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  MapPin,
  Clock,
  Star,
  Smartphone,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Truck,
  CreditCard,
  Bell,
  Share2,
  Plus,
  ArrowLeft,
  Wifi,
  WifiOff,
} from "lucide-react";

// ── Paleta de cores ──────────────────────────────────────────────────────────
const PURPLE       = "oklch(0.38 0.22 305)";
const PURPLE_MID   = "oklch(0.50 0.22 305)";
const PURPLE_SOFT  = "oklch(0.94 0.04 305)";
const PURPLE_DARK  = "oklch(0.22 0.18 305)";
const GOLD         = "oklch(0.77 0.19 90)";
const GOLD_SOFT    = "oklch(0.97 0.04 90)";
const WHITE        = "oklch(0.99 0 0)";
const DARK         = "oklch(0.12 0 0)";
const GRAY         = "oklch(0.45 0.03 305)";

const LOGO_URL     = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";
const APP_LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/logo-recanto-app-BiGZ2DoJqLYmsEJWh6h9pU.webp";

// ── Dados das funcionalidades ────────────────────────────────────────────────
const features = [
  {
    icon: <ShoppingCart className="w-7 h-7" />,
    title: "Cardápio Completo",
    description: "Navegue pelo cardápio com todos os produtos disponíveis, preços atualizados e categorias organizadas. Adicione ao carrinho com um toque.",
    color: PURPLE,
    bg: PURPLE_SOFT,
  },
  {
    icon: <Truck className="w-7 h-7" />,
    title: "Rastreamento em Tempo Real",
    description: "Acompanhe seu pedido em tempo real — desde a confirmação, preparo, saída para entrega até a chegada na sua porta.",
    color: "oklch(0.45 0.18 145)",
    bg: "oklch(0.94 0.05 145)",
  },
  {
    icon: <CreditCard className="w-7 h-7" />,
    title: "Múltiplas Formas de Pagamento",
    description: "Pague com dinheiro (com troco), PIX, cartão de débito, crédito ou diretamente pelo app com cartão online via Stripe.",
    color: "oklch(0.55 0.18 200)",
    bg: "oklch(0.94 0.04 200)",
  },
  {
    icon: <MapPin className="w-7 h-7" />,
    title: "Entrega no Seu Endereço",
    description: "Informe seu endereço completo com bairro e complemento. Nossos entregadores usam o GPS para chegar com precisão.",
    color: "oklch(0.52 0.22 25)",
    bg: "oklch(0.97 0.03 25)",
  },
  {
    icon: <Clock className="w-7 h-7" />,
    title: "Pedido em Minutos",
    description: "Faça seu pedido em menos de 2 minutos, sem cadastro obrigatório. Escolha, pague e aguarde — simples assim.",
    color: GOLD,
    bg: GOLD_SOFT,
  },
  {
    icon: <WifiOff className="w-7 h-7" />,
    title: "Funciona Offline (PWA)",
    description: "Instale o app no seu celular e acesse o cardápio mesmo sem internet. Disponível para iOS e Android sem precisar da App Store.",
    color: PURPLE_MID,
    bg: PURPLE_SOFT,
  },
];

// ── Telas do app (mockups descritivos) ──────────────────────────────────────
const screens = [
  {
    title: "Cardápio",
    description: "Todos os produtos com fotos, preços e categorias. Adicione ao carrinho com um toque.",
    emoji: "🍇",
    color: PURPLE,
    bg: PURPLE_SOFT,
    items: ["Açaí Tradicional 300ml", "Açaí de Garrafa 500ml", "Combo Irresistível", "Açaí de KitKat"],
  },
  {
    title: "Carrinho",
    description: "Revise seus itens, veja o subtotal, frete e total antes de finalizar.",
    emoji: "🛒",
    color: "oklch(0.55 0.18 200)",
    bg: "oklch(0.94 0.04 200)",
    items: ["Resumo dos itens", "Taxa de entrega R$4,90", "Total do pedido", "Botão finalizar"],
  },
  {
    title: "Checkout",
    description: "Preencha endereço, escolha o pagamento e confirme. Tudo em uma tela só.",
    emoji: "📋",
    color: "oklch(0.45 0.18 145)",
    bg: "oklch(0.94 0.05 145)",
    items: ["Nome e telefone", "Endereço completo", "Forma de pagamento", "Campo de troco"],
  },
  {
    title: "Rastreamento",
    description: "Acompanhe o status do pedido em tempo real com timeline visual.",
    emoji: "📍",
    color: "oklch(0.52 0.22 25)",
    bg: "oklch(0.97 0.03 25)",
    items: ["Pedido confirmado", "Em preparo", "Saiu para entrega", "Entregue ✓"],
  },
];

// ── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Preciso criar uma conta para pedir?",
    a: "Não! Você pode fazer pedidos sem criar conta. Basta informar seu nome, telefone e endereço no checkout.",
  },
  {
    q: "O app funciona no iPhone (iOS)?",
    a: "Sim! O app é um PWA (Progressive Web App) e funciona em qualquer celular. No iPhone, abra o site no Safari, toque em 'Compartilhar' e depois 'Adicionar à Tela de Início'.",
  },
  {
    q: "Como instalo no Android?",
    a: "No Android, abra o site no Chrome. Um banner de instalação aparecerá automaticamente. Se não aparecer, toque nos três pontinhos e selecione 'Adicionar à tela inicial'.",
  },
  {
    q: "Qual a área de entrega?",
    a: "Atendemos toda a cidade. Entre em contato pelo WhatsApp (21) 98174-9450 para confirmar se seu bairro está na área de cobertura.",
  },
  {
    q: "Quanto tempo demora a entrega?",
    a: "Em média 30 a 45 minutos após a confirmação do pedido, dependendo da sua localização e do volume de pedidos.",
  },
  {
    q: "Posso pagar com PIX?",
    a: "Sim! Aceitamos PIX, dinheiro (com troco), cartão de débito, crédito na maquininha e cartão online pelo app.",
  },
];

// ── Componente de tela mockup ────────────────────────────────────────────────
function PhoneMockup({ screen }: { screen: typeof screens[0] }) {
  return (
    <div
      className="rounded-[2rem] overflow-hidden shadow-2xl border-4 w-52 mx-auto"
      style={{ borderColor: screen.color, background: WHITE }}
    >
      {/* Status bar */}
      <div className="h-7 flex items-center justify-between px-4" style={{ background: screen.color }}>
        <span className="text-[10px] font-black text-white">9:41</span>
        <div className="flex gap-1">
          <Wifi className="w-3 h-3 text-white" />
          <span className="text-[10px] font-black text-white">100%</span>
        </div>
      </div>
      {/* App header */}
      <div className="px-3 py-2 flex items-center gap-2" style={{ background: screen.color }}>
        <img src={APP_LOGO_URL} alt="Logo" className="w-6 h-6 rounded-full object-cover" />
        <span className="text-white font-black text-xs">Recanto do Açaí</span>
      </div>
      {/* Screen content */}
      <div className="p-3" style={{ background: screen.bg, minHeight: 220 }}>
        <div className="text-center mb-3">
          <span className="text-4xl">{screen.emoji}</span>
          <p className="font-black text-sm mt-1" style={{ color: DARK }}>{screen.title}</p>
        </div>
        <div className="space-y-1.5">
          {screen.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl px-2 py-1.5" style={{ background: WHITE }}>
              <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: screen.color }} />
              <span className="text-[10px] font-bold" style={{ color: DARK }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Componente FAQ ────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: open ? PURPLE : "oklch(0.88 0.04 305)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left font-black text-sm"
        style={{ background: open ? PURPLE_SOFT : WHITE, color: DARK }}
      >
        <span>{q}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: PURPLE }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: GRAY }} />}
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 text-sm font-semibold" style={{ background: PURPLE_SOFT, color: GRAY }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AppDownload() {
  const [, navigate] = useLocation();

  const handleInstall = () => {
    // Tenta disparar o evento de instalação PWA ou redireciona para /instalar
    navigate("/instalar");
  };

  return (
    <div className="min-h-screen" style={{ background: WHITE, fontFamily: "Nunito, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 shadow-sm" style={{ background: PURPLE }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO_URL} alt="Logo" className="w-8 h-8 rounded-full object-cover border-2 border-white/30" />
            <span className="font-black text-white text-base">Recanto do Açaí</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="text-white/80 hover:text-white font-bold text-sm flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Cardápio
            </button>
            <Button
              onClick={handleInstall}
              size="sm"
              className="font-black rounded-full px-4"
              style={{ background: GOLD, color: DARK }}
            >
              <Download className="w-4 h-4 mr-1" />
              Instalar
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 50%, ${PURPLE_MID} 100%)` }}
      >
        {/* Decorações geométricas */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10" style={{ background: GOLD, transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: WHITE, transform: "translate(-30%, 30%)" }} />

        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: "rgba(255,255,255,0.15)" }}>
                <Star className="w-4 h-4" style={{ color: GOLD }} />
                <span className="text-white font-bold text-sm">App gratuito · Sem cadastro</span>
              </div>
              <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-4">
                Açaí fresquinho
                <br />
                <span style={{ color: GOLD }}>na sua porta!</span>
              </h1>
              <p className="text-white/80 font-semibold text-lg mb-8 leading-relaxed">
                Instale o app do Recanto do Açaí no seu celular e peça em menos de 2 minutos. Sem App Store, sem cadastro, sem complicação.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleInstall}
                  size="lg"
                  className="font-black rounded-2xl px-8 text-base gap-2 shadow-lg"
                  style={{ background: GOLD, color: DARK }}
                >
                  <Download className="w-5 h-5" />
                  Instalar no Celular
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  size="lg"
                  className="font-black rounded-2xl px-8 text-base gap-2 border-2"
                  style={{ borderColor: "rgba(255,255,255,0.4)", color: WHITE, background: "transparent" }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Pedir Agora
                </Button>
              </div>
              {/* Badges de confiança */}
              <div className="flex flex-wrap gap-4 mt-8">
                {[
                  { icon: "⚡", text: "Entrega em 30–45 min" },
                  { icon: "💳", text: "5 formas de pagamento" },
                  { icon: "📍", text: "Rastreamento em tempo real" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-2">
                    <span className="text-lg">{b.icon}</span>
                    <span className="text-white/80 font-semibold text-sm">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup do app */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Telefone principal */}
                <div
                  className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 w-64"
                  style={{ borderColor: "rgba(255,255,255,0.3)", background: WHITE }}
                >
                  {/* Status bar */}
                  <div className="h-8 flex items-center justify-between px-5" style={{ background: PURPLE }}>
                    <span className="text-[11px] font-black text-white">9:41</span>
                    <div className="flex gap-1 items-center">
                      <Wifi className="w-3.5 h-3.5 text-white" />
                      <span className="text-[11px] font-black text-white">100%</span>
                    </div>
                  </div>
                  {/* App header */}
                  <div className="px-4 py-3 flex items-center gap-3" style={{ background: PURPLE }}>
                    <img src={APP_LOGO_URL} alt="Logo" className="w-8 h-8 rounded-full object-cover border-2 border-white/30" />
                    <div>
                      <p className="text-white font-black text-sm leading-none">Recanto do Açaí</p>
                      <p className="text-white/70 text-[10px] font-semibold">Delivery</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: GOLD }}>
                      <Clock className="w-3 h-3" style={{ color: DARK }} />
                      <span className="text-[10px] font-black" style={{ color: DARK }}>30–45 min</span>
                    </div>
                  </div>
                  {/* Hero banner */}
                  <div className="px-4 py-4" style={{ background: "oklch(0.96 0.02 305)" }}>
                    <div className="rounded-2xl p-4 text-center" style={{ background: PURPLE_SOFT }}>
                      <span className="text-5xl">🍇</span>
                      <p className="font-black text-sm mt-2" style={{ color: PURPLE }}>Açaí Fresquinho!</p>
                      <p className="text-[10px] font-semibold mt-0.5" style={{ color: GRAY }}>Batido na hora com amor</p>
                    </div>
                  </div>
                  {/* Produtos */}
                  <div className="px-4 pb-4 space-y-2" style={{ background: "oklch(0.96 0.02 305)" }}>
                    <p className="font-black text-xs" style={{ color: DARK }}>Nosso Cardápio</p>
                    {["Açaí Tradicional 300ml — R$15,00", "Açaí de Garrafa 500ml — R$22,00", "Combo Irresistível — R$38,00"].map((p) => (
                      <div key={p} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: WHITE }}>
                        <span className="text-[10px] font-bold" style={{ color: DARK }}>{p.split("—")[0]}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-black" style={{ color: PURPLE }}>{p.split("—")[1]}</span>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: PURPLE }}>
                            <Plus className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Badge flutuante */}
                <div
                  className="absolute -top-3 -right-3 rounded-2xl px-3 py-2 shadow-lg"
                  style={{ background: GOLD }}
                >
                  <p className="font-black text-xs" style={{ color: DARK }}>Grátis!</p>
                  <p className="text-[10px] font-semibold" style={{ color: DARK }}>Sem App Store</p>
                </div>
                {/* Badge inferior */}
                <div
                  className="absolute -bottom-3 -left-3 rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2"
                  style={{ background: "oklch(0.45 0.18 145)" }}
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <p className="font-black text-xs text-white">Pedido confirmado!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ── */}
      <section className="py-16 sm:py-20" style={{ background: WHITE }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-black text-3xl sm:text-4xl mb-3" style={{ color: DARK }}>
              Tudo que você precisa
            </h2>
            <p className="font-semibold text-lg" style={{ color: GRAY }}>
              Um app completo para pedir seu açaí favorito com facilidade
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 border-2 hover:shadow-md transition-shadow"
                style={{ background: f.bg, borderColor: "transparent" }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: WHITE, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="font-black text-base mb-2" style={{ color: DARK }}>{f.title}</h3>
                <p className="font-semibold text-sm leading-relaxed" style={{ color: GRAY }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Screenshots das telas ── */}
      <section className="py-16 sm:py-20" style={{ background: "oklch(0.97 0.01 305)" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-black text-3xl sm:text-4xl mb-3" style={{ color: DARK }}>
              Conheça as telas do app
            </h2>
            <p className="font-semibold text-lg" style={{ color: GRAY }}>
              Interface simples e intuitiva, pensada para facilitar seu pedido
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {screens.map((screen) => (
              <div key={screen.title} className="flex flex-col items-center gap-4">
                <PhoneMockup screen={screen} />
                <div className="text-center">
                  <p className="font-black text-sm" style={{ color: DARK }}>{screen.title}</p>
                  <p className="font-semibold text-xs mt-1" style={{ color: GRAY }}>{screen.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como instalar ── */}
      <section className="py-16 sm:py-20" style={{ background: WHITE }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-black text-3xl sm:text-4xl mb-3" style={{ color: DARK }}>
              Como instalar o app
            </h2>
            <p className="font-semibold text-lg" style={{ color: GRAY }}>
              Sem App Store, sem Play Store — instale direto pelo navegador em segundos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* iOS */}
            <div className="rounded-2xl p-6 border-2" style={{ borderColor: PURPLE, background: PURPLE_SOFT }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black" style={{ background: DARK, color: WHITE }}>
                  
                </div>
                <div>
                  <p className="font-black text-base" style={{ color: DARK }}>iPhone / iPad</p>
                  <p className="font-semibold text-xs" style={{ color: GRAY }}>iOS 14 ou superior</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Abra o Safari e acesse o site" },
                  { step: "2", text: "Toque no ícone de Compartilhar (quadrado com seta)" },
                  { step: "3", text: "Role para baixo e toque em 'Adicionar à Tela de Início'" },
                  { step: "4", text: "Confirme tocando em 'Adicionar' no canto superior direito" },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5"
                      style={{ background: PURPLE, color: WHITE }}
                    >
                      {s.step}
                    </div>
                    <p className="font-semibold text-sm" style={{ color: DARK }}>{s.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl flex items-start gap-2" style={{ background: WHITE }}>
                <Bell className="w-4 h-4 shrink-0 mt-0.5" style={{ color: PURPLE }} />
                <p className="text-xs font-semibold" style={{ color: GRAY }}>
                  <strong style={{ color: DARK }}>Dica:</strong> Use obrigatoriamente o Safari no iPhone. Outros navegadores não suportam instalação PWA no iOS.
                </p>
              </div>
            </div>

            {/* Android */}
            <div className="rounded-2xl p-6 border-2" style={{ borderColor: "oklch(0.45 0.18 145)", background: "oklch(0.94 0.05 145)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black" style={{ background: "oklch(0.45 0.18 145)", color: WHITE }}>
                  🤖
                </div>
                <div>
                  <p className="font-black text-base" style={{ color: DARK }}>Android</p>
                  <p className="font-semibold text-xs" style={{ color: GRAY }}>Chrome ou Edge</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Abra o Chrome e acesse o site" },
                  { step: "2", text: "Um banner 'Adicionar à tela inicial' aparecerá automaticamente" },
                  { step: "3", text: "Se não aparecer, toque nos 3 pontinhos (⋮) no canto superior" },
                  { step: "4", text: "Selecione 'Adicionar à tela inicial' e confirme" },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5"
                      style={{ background: "oklch(0.45 0.18 145)", color: WHITE }}
                    >
                      {s.step}
                    </div>
                    <p className="font-semibold text-sm" style={{ color: DARK }}>{s.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl flex items-start gap-2" style={{ background: WHITE }}>
                <Smartphone className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "oklch(0.45 0.18 145)" }} />
                <p className="text-xs font-semibold" style={{ color: GRAY }}>
                  <strong style={{ color: DARK }}>Dica:</strong> O app instalado ocupa menos de 1MB e funciona como um app nativo, com ícone na tela inicial.
                </p>
              </div>
            </div>
          </div>

          {/* CTA central */}
          <div className="mt-10 text-center">
            <Button
              onClick={handleInstall}
              size="lg"
              className="font-black rounded-2xl px-10 text-base gap-2 shadow-lg"
              style={{ background: PURPLE, color: WHITE }}
            >
              <Download className="w-5 h-5" />
              Ver Instruções Detalhadas
            </Button>
          </div>
        </div>
      </section>

      {/* ── Depoimentos ── */}
      <section className="py-16 sm:py-20" style={{ background: "oklch(0.97 0.01 305)" }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-black text-3xl sm:text-4xl mb-3" style={{ color: DARK }}>
              O que nossos clientes dizem
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { name: "Ana Paula", bairro: "Tijuca", text: "Pedi pelo app e chegou em 35 minutos! Açaí delicioso e o rastreamento em tempo real é incrível.", stars: 5 },
              { name: "Carlos Eduardo", bairro: "Madureira", text: "Muito fácil de instalar e usar. Já pedi 3 vezes essa semana. O combo irresistível é sensacional!", stars: 5 },
              { name: "Fernanda Lima", bairro: "Méier", text: "Finalmente um app de açaí que funciona no iPhone sem precisar baixar nada. Recomendo muito!", stars: 5 },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl p-5 border-2" style={{ background: WHITE, borderColor: "oklch(0.88 0.04 305)" }}>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: GOLD }} />
                  ))}
                </div>
                <p className="font-semibold text-sm mb-4 leading-relaxed" style={{ color: DARK }}>"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{ background: PURPLE_SOFT, color: PURPLE }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-xs" style={{ color: DARK }}>{t.name}</p>
                    <p className="font-semibold text-[10px]" style={{ color: GRAY }}>{t.bairro}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-20" style={{ background: WHITE }}>
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-black text-3xl sm:text-4xl mb-3" style={{ color: DARK }}>
              Dúvidas frequentes
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section
        className="py-16 sm:py-20 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE} 100%)` }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: GOLD, transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{ background: WHITE, transform: "translate(-30%, 30%)" }} />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-white/30 mx-auto mb-6 shadow-xl">
            <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
          </div>
          <h2 className="font-black text-3xl sm:text-4xl text-white mb-4">
            Pronto para pedir?
          </h2>
          <p className="text-white/80 font-semibold text-lg mb-8">
            Instale o app agora e ganhe praticidade. Açaí fresquinho a um toque de distância.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleInstall}
              size="lg"
              className="font-black rounded-2xl px-10 text-base gap-2 shadow-lg"
              style={{ background: GOLD, color: DARK }}
            >
              <Download className="w-5 h-5" />
              Instalar Grátis
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="lg"
              className="font-black rounded-2xl px-10 text-base gap-2 border-2"
              style={{ borderColor: "rgba(255,255,255,0.4)", color: WHITE, background: "transparent" }}
            >
              <ShoppingCart className="w-5 h-5" />
              Pedir pelo Site
            </Button>
          </div>
          {/* Compartilhar */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "Recanto do Açaí", text: "Peça açaí fresquinho pelo app!", url: window.location.origin + "/app" });
              } else {
                navigator.clipboard.writeText(window.location.origin + "/app");
                alert("Link copiado!");
              }
            }}
            className="mt-6 flex items-center gap-2 mx-auto text-white/70 hover:text-white font-semibold text-sm"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar com amigos
          </button>
        </div>
      </section>

      {/* ── Rodapé ── */}
      <footer className="py-8" style={{ background: PURPLE_DARK }}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO_URL} alt="Logo" className="w-7 h-7 rounded-full object-cover" />
            <span className="font-black text-white text-sm">Recanto do Açaí</span>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate("/")} className="text-white/60 hover:text-white font-semibold text-xs">Cardápio</button>
            <button onClick={() => navigate("/instalar")} className="text-white/60 hover:text-white font-semibold text-xs">Instalar App</button>
            <a href="https://wa.me/5521981749450" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white font-semibold text-xs">WhatsApp</a>
          </div>
          <p className="text-white/40 text-xs font-semibold">© 2025 Recanto do Açaí</p>
        </div>
      </footer>
    </div>
  );
}
