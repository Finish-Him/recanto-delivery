import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { MemphisShapes } from "@/components/MemphisShapes";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

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
    <div className="min-h-screen relative" style={{ background: "oklch(0.94 0.04 55)" }}>
      <MemphisShapes />

      {/* Header */}
      <header className="relative z-10 sticky top-0 shadow-sm" style={{ background: "oklch(0.12 0 0)" }}>
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-lg"
              style={{ background: "oklch(0.52 0.19 25)", color: "white", fontFamily: "Syne, sans-serif" }}
            >
              R
            </div>
            <div>
              <h1
                className="font-display font-black uppercase text-lg leading-none tracking-tight"
                style={{ color: "oklch(0.99 0 0)" }}
              >
                Recanto do Açaí
              </h1>
              <p className="text-xs font-semibold" style={{ color: "oklch(0.88 0.07 160)" }}>
                Delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold" style={{ color: "oklch(0.93 0.12 90)" }}>
              <Clock className="w-3.5 h-3.5" />
              <span>30-45 min</span>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-transform hover:scale-105"
              style={{ background: "oklch(0.52 0.19 25)", color: "white" }}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Carrinho</span>
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-black flex items-center justify-center"
                  style={{ background: "oklch(0.93 0.12 90)", color: "oklch(0.12 0 0)" }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 py-12 sm:py-16">
        <div className="container text-center">
          <div
            className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-4"
            style={{ background: "oklch(0.88 0.07 160)", color: "oklch(0.12 0 0)" }}
          >
            🛵 Entrega rápida na sua porta
          </div>
          <h2
            className="font-display font-black uppercase text-4xl sm:text-6xl leading-none mb-4"
            style={{ color: "oklch(0.12 0 0)", textShadow: "4px 4px 0px rgba(0,0,0,0.10)" }}
          >
            O Melhor Açaí
            <br />
            <span style={{ color: "oklch(0.52 0.19 25)" }}>da Cidade!</span>
          </h2>
          <p className="text-base sm:text-lg font-semibold max-w-md mx-auto" style={{ color: "oklch(0.35 0.02 55)" }}>
            Batido na hora, com ingredientes frescos e muito amor. Peça agora!
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm font-semibold" style={{ color: "oklch(0.45 0.02 55)" }}>
            <MapPin className="w-4 h-4" style={{ color: "oklch(0.52 0.19 25)" }} />
            <span>Entregamos em toda a cidade</span>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="relative z-10 pb-24">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="font-display font-black uppercase text-2xl" style={{ color: "oklch(0.12 0 0)" }}>
              Cardápio
            </h3>
            <div className="h-1 flex-1 rounded-full" style={{ background: "oklch(0.52 0.19 25)" }} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "oklch(0.99 0 0)" }}>
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => {
                const qty = getItemQuantity(product.id);
                return (
                  <div
                    key={product.id}
                    className="rounded-2xl overflow-hidden shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                    style={{ background: "oklch(0.99 0 0)", border: "2px solid oklch(0.80 0.05 55)" }}
                  >
                    <div className="relative h-52 overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: "oklch(0.94 0.04 55)" }}>
                          🍇
                        </div>
                      )}
                      <div
                        className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black uppercase"
                        style={{ background: "oklch(0.93 0.12 90)", color: "oklch(0.12 0 0)" }}
                      >
                        {product.category}
                      </div>
                    </div>

                    <div className="p-5">
                      <h4
                        className="font-black text-lg uppercase leading-tight mb-1"
                        style={{ color: "oklch(0.12 0 0)", fontFamily: "Syne, sans-serif" }}
                      >
                        {product.name}
                      </h4>
                      <p className="text-sm font-semibold mb-4 leading-relaxed" style={{ color: "oklch(0.45 0.02 55)" }}>
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span
                          className="font-black text-2xl"
                          style={{ color: "oklch(0.52 0.19 25)", fontFamily: "Syne, sans-serif" }}
                        >
                          R$ {parseFloat(product.price).toFixed(2).replace(".", ",")}
                        </span>

                        {qty === 0 ? (
                          <Button
                            onClick={() => handleAdd(product)}
                            className="font-bold uppercase rounded-xl px-5 py-2 transition-transform hover:scale-105"
                            style={{ background: "oklch(0.52 0.19 25)", color: "white" }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(product.id, qty - 1)}
                              className="w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold transition-colors hover:bg-gray-50"
                              style={{ borderColor: "oklch(0.52 0.19 25)", color: "oklch(0.52 0.19 25)" }}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-black text-lg" style={{ color: "oklch(0.12 0 0)" }}>
                              {qty}
                            </span>
                            <button
                              onClick={() => handleAdd(product)}
                              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white transition-opacity hover:opacity-80"
                              style={{ background: "oklch(0.52 0.19 25)" }}
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
            className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-white transition-transform hover:scale-105"
            style={{ background: "oklch(0.12 0 0)", minWidth: 280 }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm"
              style={{ background: "oklch(0.52 0.19 25)" }}
            >
              {totalItems}
            </div>
            <span className="flex-1 text-left">Ver Carrinho</span>
            <span className="font-black" style={{ fontFamily: "Syne, sans-serif" }}>
              R$ {totalAmount.toFixed(2).replace(".", ",")}
            </span>
          </button>
        </div>
      )}

      <CartDrawer />
    </div>
  );
}
