import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { MemphisShapes } from "@/components/MemphisShapes";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, MapPin, Clock, Star } from "lucide-react";
import { toast } from "sonner";

// Cores da marca
const PURPLE = "oklch(0.38 0.22 305)";
const PURPLE_MED = "oklch(0.46 0.25 305)";
const GOLD = "oklch(0.77 0.19 90)";
const GOLD_LIGHT = "oklch(0.94 0.10 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";

export default function Home() {
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const { addItem, updateQuantity, items, totalItems, totalAmount, setIsOpen } = useCart();

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

      {/* Header */}
      <header
        className="relative z-10 sticky top-0 shadow-sm"
        style={{ background: PURPLE }}
      >
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
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
          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: "oklch(0.32 0.20 305)", color: GOLD }}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>30–45 min</span>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: GOLD, color: DARK }}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline font-black">Carrinho</span>
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-black flex items-center justify-center"
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
        <div className="container py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 text-center sm:text-left">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black mb-4"
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
              <p className="text-sm sm:text-base font-semibold mb-5 max-w-sm" style={{ color: "oklch(0.85 0.05 305)" }}>
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
                className="w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 shadow-2xl"
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
      <section className="relative z-10 pb-28">
        <div className="container pt-8">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full" style={{ background: PURPLE }} />
            <h3
              className="font-black text-2xl"
              style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
            >
              Nosso Cardápio
            </h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products?.map((product) => {
                const qty = getItemQuantity(product.id);
                return (
                  <div
                    key={product.id}
                    className="rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: WHITE, border: `2px solid ${BORDER}` }}
                  >
                    {/* Product image */}
                    <div className="relative h-48 overflow-hidden" style={{ background: "oklch(0.96 0.01 305)" }}>
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
                        className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black uppercase"
                        style={{ background: PURPLE, color: WHITE }}
                      >
                        {product.category}
                      </div>
                    </div>

                    {/* Product info */}
                    <div className="p-5">
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

                      <div className="flex items-center justify-between">
                        <span
                          className="font-black text-2xl"
                          style={{ color: PURPLE, fontFamily: "Nunito, sans-serif" }}
                        >
                          R$ {parseFloat(product.price).toFixed(2).replace(".", ",")}
                        </span>

                        {qty === 0 ? (
                          <Button
                            onClick={() => handleAdd(product)}
                            className="font-black rounded-xl px-4 py-2 text-sm transition-all hover:opacity-90 active:scale-95"
                            style={{ background: PURPLE, color: WHITE }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(product.id, qty - 1)}
                              className="w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold transition-colors hover:bg-purple-50"
                              style={{ borderColor: PURPLE, color: PURPLE }}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span
                              className="w-8 text-center font-black text-lg"
                              style={{ color: DARK }}
                            >
                              {qty}
                            </span>
                            <button
                              onClick={() => handleAdd(product)}
                              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white transition-opacity hover:opacity-80"
                              style={{ background: PURPLE }}
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

      {/* Floating cart button on mobile */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-20 flex justify-center px-4">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold transition-transform hover:scale-105 active:scale-95"
            style={{ background: PURPLE, color: WHITE, minWidth: 280 }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm"
              style={{ background: GOLD, color: DARK }}
            >
              {totalItems}
            </div>
            <span className="flex-1 text-left font-black">Ver Carrinho</span>
            <span className="font-black" style={{ color: GOLD }}>
              R$ {totalAmount.toFixed(2).replace(".", ",")}
            </span>
          </button>
        </div>
      )}

      <CartDrawer />
    </div>
  );
}
