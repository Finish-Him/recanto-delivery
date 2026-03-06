import { useEffect, useState } from "react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/logo-recanto-app-BiGZ2DoJqLYmsEJWh6h9pU.webp";
const ACAI_ICON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/icon-acai-bowl-66asfMkv2yeAPnrZ7Jcqsm.webp";

const PURPLE      = "oklch(0.38 0.22 305)";
const PURPLE_DARK = "oklch(0.22 0.22 305)";
const GOLD        = "oklch(0.77 0.19 90)";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fase 1: entrada (logo aparece)
    const enterTimer = setTimeout(() => setPhase("show"), 100);

    // Progresso da barra
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return p + 2;
      });
    }, 30);

    // Fase 2: saída (fade out)
    const exitTimer = setTimeout(() => setPhase("exit"), 1800);

    // Fase 3: remove o splash
    const finishTimer = setTimeout(() => onFinish(), 2200);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
      clearInterval(progressInterval);
    };
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: `radial-gradient(ellipse at center, ${PURPLE} 0%, ${PURPLE_DARK} 100%)`,
        opacity: phase === "exit" ? 0 : 1,
        transition: phase === "exit" ? "opacity 0.4s ease-out" : "opacity 0.3s ease-in",
        pointerEvents: phase === "exit" ? "none" : "all",
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: GOLD, transform: "translate(30%, -30%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
        style={{ background: GOLD, transform: "translate(-30%, 30%)" }}
      />

      {/* Main content */}
      <div
        className="flex flex-col items-center gap-6"
        style={{
          transform: phase === "enter" ? "scale(0.85) translateY(20px)" : "scale(1) translateY(0)",
          opacity: phase === "enter" ? 0 : 1,
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out",
        }}
      >
        {/* Logo */}
        <div className="relative">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl"
            style={{ background: "oklch(0.28 0.22 305)", border: `3px solid ${GOLD}` }}
          >
            <img
              src={LOGO_URL}
              alt="Recanto do Açaí"
              className="w-28 h-28 rounded-full object-cover"
            />
          </div>

          {/* Açaí bowl floating badge */}
          <div
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: GOLD }}
          >
            <img src={ACAI_ICON} alt="" className="w-7 h-7 object-contain" />
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1
            className="font-black text-3xl tracking-tight leading-none"
            style={{ color: "oklch(0.99 0 0)", fontFamily: "Nunito, sans-serif" }}
          >
            Recanto do Açaí
          </h1>
          <p
            className="font-bold text-sm mt-1 tracking-widest uppercase"
            style={{ color: GOLD }}
          >
            Delivery
          </p>
        </div>

        {/* Loading bar */}
        <div
          className="w-48 h-1.5 rounded-full overflow-hidden"
          style={{ background: "oklch(0.32 0.18 305)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${GOLD}, oklch(0.88 0.22 90))`,
            }}
          />
        </div>

        {/* Tagline */}
        <p
          className="text-xs font-semibold"
          style={{ color: "oklch(0.65 0.08 305)" }}
        >
          Açaí fresquinho na sua porta 🍇
        </p>
      </div>
    </div>
  );
}
