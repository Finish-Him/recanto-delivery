import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Share2, Smartphone, CheckCircle2, Star } from "lucide-react";

const PURPLE      = "oklch(0.38 0.22 305)";
const PURPLE_DARK = "oklch(0.28 0.22 305)";
const PURPLE_CARD = "oklch(0.32 0.20 305)";
const GOLD        = "oklch(0.77 0.19 90)";
const WHITE       = "oklch(0.99 0 0)";

const LOGO_URL       = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";
const BANNER_IOS     = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/banner-install-ios-Vt5eSqCDQtSRtnaLP7Yn9s.webp";
const BANNER_ANDROID = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/banner-install-android-V4s26WgaZ6XRRLRgX6AVRA.webp";
const BANNER_FEATURES= "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/banner-app-features-DozRZrDof59hAJgc7SiqF4.webp";

export default function AppDownload() {
  const [tab, setTab] = useState<"android" | "ios">("android");

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Recanto do Açaí — Delivery",
        text: "Instale o app do Recanto do Açaí e peça seu açaí fresquinho!",
        url: window.location.origin + "/app",
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + "/app");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: PURPLE_DARK, fontFamily: "Nunito, sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-50 shadow-lg" style={{ background: PURPLE }}>
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between" style={{ minHeight: 60 }}>
          <Link href="/">
            <button className="flex items-center gap-2 font-bold text-sm rounded-full px-3 py-2 transition hover:opacity-80" style={{ color: GOLD }}>
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Cardápio</span>
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Recanto do Açaí" className="w-9 h-9 rounded-full object-cover border-2" style={{ borderColor: GOLD }} />
            <span className="font-black text-base" style={{ color: WHITE }}>Recanto do Açaí</span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm font-bold rounded-full px-3 py-2 transition hover:opacity-80"
            style={{ background: GOLD, color: PURPLE_DARK }}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-10 px-4 text-center" style={{ background: PURPLE }}>
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-black px-4 py-2 rounded-full mb-4" style={{ background: GOLD, color: PURPLE_DARK }}>
            <Smartphone className="w-4 h-4" />
            GRÁTIS · SEM CADASTRO
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 leading-tight" style={{ color: WHITE }}>
            Baixe o App e<br />
            <span style={{ color: GOLD }}>Peça Mais Rápido!</span>
          </h1>
          <p className="text-base font-semibold mb-5 opacity-90" style={{ color: WHITE }}>
            Açaí fresquinho na sua porta em 30–45 min
          </p>
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" style={{ color: GOLD }} />
            ))}
            <span className="font-black text-base ml-2" style={{ color: WHITE }}>5.0</span>
            <span className="text-sm opacity-60 ml-1" style={{ color: WHITE }}>· 200+ pedidos</span>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-lg font-black px-8 py-4 rounded-2xl shadow-xl transition hover:opacity-90 active:scale-95"
            style={{ background: GOLD, color: PURPLE_DARK }}
          >
            <Smartphone className="w-6 h-6" />
            Instalar Agora — É Grátis!
          </a>
        </div>
      </section>

      {/* Banner "Peça pelo App" */}
      <section className="px-4 pt-6 pb-2 max-w-3xl mx-auto">
        <img
          src={BANNER_FEATURES}
          alt="Peça pelo App — 4 telas do app"
          className="w-full rounded-3xl shadow-2xl"
          loading="lazy"
        />
      </section>

      {/* Benefícios — ícones grandes, texto mínimo */}
      <section className="px-4 py-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: "🍇", label: "Cardápio Completo" },
            { emoji: "⚡", label: "Pedido em 1 min" },
            { emoji: "📍", label: "Rastreie ao Vivo" },
            { emoji: "💳", label: "Pix, Cartão, Dinheiro" },
            { emoji: "🔔", label: "Notificações" },
            { emoji: "🎁", label: "Sem Taxa de App" },
          ].map((b) => (
            <div
              key={b.label}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl text-center"
              style={{ background: PURPLE_CARD }}
            >
              <span className="text-3xl">{b.emoji}</span>
              <span className="text-xs font-black leading-tight" style={{ color: WHITE }}>{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Seção de instalação com tabs */}
      <section className="px-4 pb-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-black text-center mb-4" style={{ color: GOLD }}>
          Como Instalar
        </h2>
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: PURPLE_CARD }}>
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => setTab("android")}
              className="flex-1 py-4 font-black text-base transition-all"
              style={{
                background: tab === "android" ? GOLD : "transparent",
                color: tab === "android" ? PURPLE_DARK : WHITE,
              }}
            >
              🤖 Android
            </button>
            <button
              onClick={() => setTab("ios")}
              className="flex-1 py-4 font-black text-base transition-all"
              style={{
                background: tab === "ios" ? GOLD : "transparent",
                color: tab === "ios" ? PURPLE_DARK : WHITE,
              }}
            >
              🍎 iPhone (iOS)
            </button>
          </div>

          {/* Banner de instalação */}
          <div className="p-4">
            <img
              src={tab === "android" ? BANNER_ANDROID : BANNER_IOS}
              alt={tab === "android" ? "Como instalar no Android — 3 passos" : "Como instalar no iPhone — 3 passos"}
              className="w-full rounded-2xl"
              loading="lazy"
            />

            {/* Banner de confirmação */}
            <div
              className="mt-4 flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: "oklch(0.26 0.18 305)" }}
            >
              <CheckCircle2 className="w-8 h-8 flex-shrink-0" style={{ color: GOLD }} />
              <div>
                <p className="font-black text-sm" style={{ color: WHITE }}>
                  Após tocar em <span style={{ color: GOLD }}>"Adicionar"</span>, o ícone do app aparece na sua tela inicial!
                </p>
                <p className="text-xs opacity-60 mt-0.5" style={{ color: WHITE }}>
                  Sem precisar baixar pela loja de apps · Funciona em qualquer celular
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 py-8 text-center max-w-lg mx-auto">
        <p className="text-2xl font-black mb-4" style={{ color: GOLD }}>
          Pronto para pedir? 🍇
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 text-lg font-black px-8 py-4 rounded-2xl shadow-xl transition hover:opacity-90 active:scale-95 w-full justify-center"
          style={{ background: GOLD, color: PURPLE_DARK }}
        >
          <Smartphone className="w-6 h-6" />
          Abrir o Cardápio
        </a>
        <p className="text-xs mt-3 opacity-50" style={{ color: WHITE }}>
          Funciona em qualquer celular · Grátis · Sem cadastro
        </p>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 px-4" style={{ borderTop: `1px solid oklch(0.45 0.15 305)` }}>
        <p className="text-xs opacity-40" style={{ color: WHITE }}>
          © 2025 Recanto do Açaí · Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}
