import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { MemphisShapes } from "@/components/MemphisShapes";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, MapPin, Clock, Star } from "lucide-react";
import { toast } from "sonner";

const PURPLE = "oklch(0.38 0.22 305)";
const PURPLE_MED = "oklch(0.46 0.25 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";

export default function Home() {
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const { addItem, updateQuantity, items, totalItems, totalAmount, grandTotal, deliveryFee, setIsOpen } = useCart();

  const getItemQuantity = (productId: number) => {
    const item = items.find((i) => i.productId === productId);
    return item?.quantity ?? 0;
  };

  const handleAdd = (product: { id: number; name: string; price: string }) => {
    addItem({
      productId: product.id,
      productName: product.name,
      unitPrice: parseFloat(product.price),
    });
    toast.success(`${product.name} adicionado!`, {
      description: "Item adicionado ao carrinho.",
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen relative" style={{ background: WHITE }}>
      <MemphisShapes />

      {/* Header — altura mínima 64px, ícones e botões com área de toque ≥48px */}
      <header
        className="relative z-10 sticky top-0 shadow-sm"
        style={{ background: PURPLE }}
      >
        <div className="container flex items-center justify-between" style={{ minHeight: 64 }}>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full overflow-hidden border-2 flex-shrink-0"
              style={{ borderColor: GOLD }}
            >
              <img
                src={LOGO_URL}
                alt="Recanto do Açaí"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1
                className="font-black text-base leading-none"
                style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}
              >
                Recanto do Açaí
              </h1>
              <p className="text-xs font-bold" style={{ color: GOLD }}>
                Delivery
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full"
              style={{ background: "oklch(0.32 0.20 305)", color: GOLD }}
            >
              <Clock className="w-4 h-4" />
              <span>30–45 min</span>
            </div>
            {/* Botão carrinho — área de toque mínima 48px */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{
                background: GOLD,
                color: DARK,
                minHeight: 48,
                minWidth: 48,
                paddingLeft: 16,
                paddingRight: 16,
              }}
              aria-label="Abrir carrinho"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline font-black">Carrinho</span>
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-xs font-black flex items-center justify-center"
                  style={{ background: WHITE, color: PURPLE }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative z-10 overflow-hidden" style={{ background: PURPLE }}>
        <div className="container py-8 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="flex-1 text-center sm:text-left">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black mb-4"
                style={{ background: GOLD, color: DARK }}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                O melhor açaí da cidade
              </div>
              <h2
                className="font-black text-3xl sm:text-5xl leading-tight mb-3"
                style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}
              >
                Açaí Fresquinho
                <br />
                <span style={{ color: GOLD }}>na sua porta!</span>
              </h2>
              <p className="text-sm sm:text-base font-semibold mb-5 max-w-sm mx-auto sm:mx-0" style={{ color: "oklch(0.85 0.05 305)" }}>
                Batido na hora, com ingredientes selecionados e muito amor. Peça agora e receba em 30–45 minutos.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold" style={{ color: GOLD }}>
                <MapPin className="w-4 h-4" />
                <span>Entregamos em toda a cidade</span>
              </div>
            </div>
            {/* Hero image */}
            <div className="relative flex-shrink-0">
              <div
                className="w-36 h-36 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 shadow-2xl"
                style={{ borderColor: GOLD }}
              >
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/acai-garrafa_e8b9f39e.jpg"
                  alt="Açaí de garrafa Recanto"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute -bottom-2 -right-2 px-3 py-1.5 rounded-full text-xs font-black shadow-lg"
                style={{ background: GOLD, color: DARK }}
              >
                🛵 Entrega rápida
              </div>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="relative h-8 overflow-hidden" style={{ marginTop: -1 }}>
          <svg viewBox="0 0 1200 48" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path d="M0,48 L0,24 Q300,0 600,24 Q900,48 1200,24 L1200,48 Z" fill={WHITE} />
          </svg>
        </div>
      </section>

      {/* Menu Section */}
      <section className="relative z-10 pb-32">
        <div className="container pt-8">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 rounded-full" style={{ background: PURPLE }} />
            <h3
              className="font-black text-2xl"
              style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
            >
              Nosso Cardápio
            </h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl overflow-hidden animate-pulse"
                  style={{ background: WHITE, border: `2px solid ${BORDER}` }}
                >
                  <div className="h-48 bg-gray-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products?.map((product) => {
                const qty = getItemQuantity(product.id);
                return (
                  <div
                    key={product.id}
                    className="rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: WHITE, border: `2px solid ${BORDER}` }}
                  >
                    {/* Product image */}
                    <div className="relative overflow-hidden" style={{ background: "oklch(0.96 0.01 305)", height: 180 }}>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={LOGO_URL}
                            alt="Recanto do Açaí"
                            className="w-28 h-28 object-contain opacity-30"
                          />
                        </div>
                      )}
                      {/* Category badge */}
                      <div
                        className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-black uppercase"
                        style={{ background: PURPLE, color: WHITE }}
                      >
                        {product.category}
                      </div>
                    </div>

                    {/* Product info */}
                    <div className="p-4 sm:p-5">
                      <h4
                        className="font-black text-base leading-tight mb-1"
                        style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
                      >
                        {product.name}
                      </h4>
                      <p
                        className="text-sm font-semibold mb-4 leading-relaxed"
                        style={{ color: GRAY }}
                      >
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between gap-3">
                        <span
                          className="font-black text-xl sm:text-2xl"
                          style={{ color: PURPLE, fontFamily: "Nunito, sans-serif" }}
                        >
                          R$ {parseFloat(product.price).toFixed(2).replace(".", ",")}
                        </span>

                        {qty === 0 ? (
                          /* Botão Adicionar — área de toque 48px */
                          <button
                            onClick={() => handleAdd(product)}
                            className="flex items-center gap-1.5 font-black rounded-xl px-4 text-sm transition-all hover:opacity-90 active:scale-95"
                            style={{
                              background: PURPLE,
                              color: WHITE,
                              minHeight: 48,
                            }}
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar
                          </button>
                        ) : (
                          /* Controles de quantidade — botões 48x48px */
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(product.id, qty - 1)}
                              className="rounded-full border-2 flex items-center justify-center font-bold transition-colors hover:bg-purple-50 active:scale-95"
                              style={{
                                borderColor: PURPLE,
                                color: PURPLE,
                                width: 44,
                                height: 44,
                              }}
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span
                              className="font-black text-lg text-center"
                              style={{ color: DARK, minWidth: 32 }}
                            >
                              {qty}
                            </span>
                            <button
                              onClick={() => handleAdd(product)}
                              className="rounded-full flex items-center justify-center font-bold text-white transition-opacity hover:opacity-80 active:scale-95"
                              style={{
                                background: PURPLE,
                                width: 44,
                                height: 44,
                              }}
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Botão flutuante do carrinho — bem posicionado no mobile */}
      {totalItems > 0 && (
        <div className="fixed bottom-5 left-0 right-0 z-20 flex justify-center px-4">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 rounded-2xl shadow-2xl font-bold transition-transform hover:scale-105 active:scale-95 w-full"
            style={{
              background: PURPLE,
              color: WHITE,
              maxWidth: 400,
              minHeight: 60,
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            <div
              className="rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: GOLD, color: DARK, width: 32, height: 32 }}
            >
              {totalItems}
            </div>
            <span className="flex-1 text-left font-black text-base">Ver Carrinho</span>
            <span className="font-black text-base" style={{ color: GOLD }}>
              R$ {grandTotal.toFixed(2).replace(".", ",")}
            </span>
          </button>
        </div>
      )}

      <CartDrawer />

      {/* Rodapé */}
      <footer
        className="mt-8 py-6 px-4 text-center"
        style={{ borderTop: `1px solid oklch(0.92 0.03 305)` }}
      >
        <p className="text-xs font-semibold mb-2" style={{ color: "oklch(0.65 0.05 305)" }}>
          © {new Date().getFullYear()} Recanto do Açaí — Todos os direitos reservados
        </p>
        <p className="text-xs" style={{ color: "oklch(0.75 0.03 305)" }}>
          Pedidos e dúvidas:{" "}
          <a
            href="https://wa.me/5521981749450"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-2"
            style={{ color: PURPLE }}
          >
            (21) 98174-9450
          </a>
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
          <a
            href="/cadastro"
            className="text-xs font-bold underline underline-offset-2 transition-opacity hover:opacity-80"
            style={{ color: PURPLE }}
          >
            Criar conta
          </a>
          <span className="text-xs" style={{ color: "oklch(0.75 0.03 305)" }}>•</span>
          <a
            href="/instalar"
            className="text-xs font-bold underline underline-offset-2 transition-opacity hover:opacity-80"
            style={{ color: PURPLE }}
          >
            Instalar App
          </a>
          <span className="text-xs" style={{ color: "oklch(0.75 0.03 305)" }}>•</span>
          <a
            href="/login"
            className="text-xs font-semibold opacity-30 hover:opacity-60 transition-opacity"
            style={{ color: "oklch(0.45 0.03 305)" }}
          >
            área restrita
          </a>
        </div>
      </footer>
    </div>
  );
}
