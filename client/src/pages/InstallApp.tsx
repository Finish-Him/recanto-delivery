import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ChevronLeft, Download, Share, Plus, MoreVertical,
  Smartphone, CheckCircle, Star, Zap, Bell, Wifi
} from "lucide-react";

const PURPLE = "oklch(0.38 0.22 305)";
const PURPLE_LIGHT = "oklch(0.96 0.03 305)";
const PURPLE_MID = "oklch(0.92 0.06 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";

type Platform = "android" | "ios" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "desktop";
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallApp() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "ios" | "desktop">("android");

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);
    if (p !== "unknown") setActiveTab(p);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallAndroid = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const benefits = [
    { icon: Zap, label: "Acesso rápido", desc: "Abra direto da tela inicial" },
    { icon: Bell, label: "Notificações", desc: "Acompanhe seu pedido" },
    { icon: Wifi, label: "Funciona offline", desc: "Veja o cardápio sem internet" },
    { icon: Star, label: "Experiência nativa", desc: "Como um app de verdade" },
  ];

  const steps = {
    android: [
      {
        num: 1,
        icon: <MoreVertical className="w-6 h-6" style={{ color: PURPLE }} />,
        title: "Toque nos 3 pontos",
        desc: 'No canto superior direito do Chrome, toque no ícone de menu (⋮)',
      },
      {
        num: 2,
        icon: <Plus className="w-6 h-6" style={{ color: PURPLE }} />,
        title: 'Selecione "Adicionar à tela inicial"',
        desc: 'Role o menu e toque em "Adicionar à tela inicial" ou "Instalar app"',
      },
      {
        num: 3,
        icon: <CheckCircle className="w-6 h-6" style={{ color: PURPLE }} />,
        title: "Confirme a instalação",
        desc: 'Toque em "Adicionar" na janela que aparecer. Pronto!',
      },
    ],
    ios: [
      {
        num: 1,
        icon: <Share className="w-6 h-6" style={{ color: PURPLE }} />,
        title: "Toque em Compartilhar",
        desc: "No Safari, toque no ícone de compartilhar (quadrado com seta para cima) na barra inferior",
      },
      {
        num: 2,
        icon: <Plus className="w-6 h-6" style={{ color: PURPLE }} />,
        title: '"Adicionar à Tela de Início"',
        desc: 'Role a lista de opções e toque em "Adicionar à Tela de Início"',
      },
      {
        num: 3,
        icon: <CheckCircle className="w-6 h-6" style={{ color: PURPLE }} />,
        title: "Confirme",
        desc: 'Toque em "Adicionar" no canto superior direito. O ícone aparecerá na sua tela!',
      },
    ],
    desktop: [
      {
        num: 1,
        icon: <Download className="w-6 h-6" style={{ color: PURPLE }} />,
        title: "Ícone na barra de endereço",
        desc: "No Chrome/Edge, procure o ícone de instalação (⊕) na barra de endereço à direita",
      },
      {
        num: 2,
        icon: <Plus className="w-6 h-6" style={{ color: PURPLE }} />,
        title: 'Clique em "Instalar"',
        desc: 'Clique no ícone e depois em "Instalar" na janela que aparecer',
      },
      {
        num: 3,
        icon: <CheckCircle className="w-6 h-6" style={{ color: PURPLE }} />,
        title: "App instalado!",
        desc: "Um atalho será criado na sua área de trabalho. Abra como qualquer programa!",
      },
    ],
  };

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
            Instalar App
          </h1>
        </div>
      </header>

      <div className="container py-6 pb-12 max-w-lg mx-auto">

        {/* Hero */}
        {installed ? (
          <div
            className="rounded-3xl p-6 mb-6 text-center shadow-md"
            style={{ background: PURPLE }}
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-3" style={{ color: GOLD }} />
            <h2 className="font-black text-2xl mb-2" style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}>
              App já instalado!
            </h2>
            <p className="font-semibold text-sm" style={{ color: "oklch(0.85 0.05 305)" }}>
              O Recanto do Açaí já está na sua tela inicial. Aproveite!
            </p>
          </div>
        ) : (
          <div
            className="rounded-3xl p-6 mb-6 text-center shadow-md"
            style={{ background: PURPLE }}
          >
            <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto mb-4 shadow-lg border-4" style={{ borderColor: GOLD }}>
              <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
            </div>
            <h2 className="font-black text-2xl mb-2" style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}>
              Instale o App Grátis!
            </h2>
            <p className="font-semibold text-sm mb-4" style={{ color: "oklch(0.85 0.05 305)" }}>
              Adicione o Recanto do Açaí na sua tela inicial e peça com ainda mais facilidade
            </p>
            {deferredPrompt && (
              <button
                onClick={handleInstallAndroid}
                className="w-full h-12 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                style={{ background: GOLD, color: DARK }}
              >
                <Download className="w-5 h-5" />
                Instalar agora
              </button>
            )}
          </div>
        )}

        {/* Benefícios */}
        <div className="mb-6">
          <h3 className="font-black text-lg mb-3 px-1" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
            Por que instalar?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {benefits.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="rounded-2xl p-4 flex flex-col gap-2 shadow-sm"
                style={{ background: WHITE }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: PURPLE_MID }}
                >
                  <Icon className="w-5 h-5" style={{ color: PURPLE }} />
                </div>
                <p className="font-black text-sm" style={{ color: DARK }}>{label}</p>
                <p className="text-xs font-semibold" style={{ color: GRAY }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs de plataforma */}
        <div className="mb-4">
          <h3 className="font-black text-lg mb-3 px-1" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
            Como instalar
          </h3>
          <div
            className="flex rounded-2xl p-1 mb-4"
            style={{ background: PURPLE_MID }}
          >
            {(["android", "ios", "desktop"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 h-10 rounded-xl font-black text-sm transition-all"
                style={{
                  background: activeTab === tab ? PURPLE : "transparent",
                  color: activeTab === tab ? WHITE : GRAY,
                }}
              >
                {tab === "android" ? "Android" : tab === "ios" ? "iPhone" : "PC/Mac"}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps[activeTab].map((step) => (
              <div
                key={step.num}
                className="rounded-2xl p-4 flex gap-4 items-start shadow-sm"
                style={{ background: WHITE }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: PURPLE_MID }}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: PURPLE, color: WHITE }}
                    >
                      {step.num}
                    </span>
                    <p className="font-black text-sm" style={{ color: DARK }}>{step.title}</p>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: GRAY }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dica de plataforma detectada */}
        {platform !== "unknown" && (
          <div
            className="rounded-2xl p-4 flex items-center gap-3 mb-4"
            style={{ background: "oklch(0.90 0.08 305)" }}
          >
            <Smartphone className="w-6 h-6 flex-shrink-0" style={{ color: PURPLE }} />
            <p className="text-sm font-semibold" style={{ color: DARK }}>
              Detectamos que você está usando{" "}
              <strong>{platform === "android" ? "Android" : platform === "ios" ? "iPhone/iPad" : "computador"}</strong>.
              {" "}Siga as instruções da aba{" "}
              <button
                onClick={() => { const t = platform as "android" | "ios" | "desktop"; setActiveTab(t); }}
                className="font-black underline underline-offset-2"
                style={{ color: PURPLE }}
              >
                {platform === "android" ? "Android" : platform === "ios" ? "iPhone" : "PC/Mac"}
              </button>{" "}acima.
            </p>
          </div>
        )}

        {/* CTA */}
        <Link href="/">
          <button
            className="w-full h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
            style={{ background: PURPLE, color: WHITE }}
          >
            <Smartphone className="w-5 h-5" />
            Ir para o Cardápio
          </button>
        </Link>
      </div>
    </div>
  );
}
