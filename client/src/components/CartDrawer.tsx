import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";

const PURPLE = "oklch(0.38 0.22 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/recanto-logo_f14240c4.jpg";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalAmount, totalItems } =
    useCart();
  const [, navigate] = useLocation();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 overflow-hidden"
        style={{ background: WHITE }}
      >
        {/* Header roxo */}
        <SheetHeader
          className="px-5 py-4 flex-row items-center gap-3"
          style={{ background: PURPLE }}
        >
          <div
            className="w-9 h-9 rounded-full overflow-hidden border-2 flex-shrink-0"
            style={{ borderColor: GOLD }}
          >
            <img src={LOGO_URL} alt="Recanto do Açaí" className="w-full h-full object-cover" />
          </div>
          <SheetTitle
            className="font-black text-lg flex-1"
            style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}
          >
            Seu Carrinho
          </SheetTitle>
          {totalItems > 0 && (
            <span
              className="text-sm font-black px-3 py-1 rounded-full"
              style={{ background: GOLD, color: DARK }}
            >
              {totalItems} {totalItems === 1 ? "item" : "itens"}
            </span>
          )}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.96 0.01 305)" }}
            >
              <ShoppingBag className="w-12 h-12" style={{ color: PURPLE }} />
            </div>
            <p className="font-black text-xl" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
              Carrinho vazio
            </p>
            <p className="text-sm font-semibold" style={{ color: GRAY }}>
              Adicione itens do cardápio para começar seu pedido!
            </p>
            <Button
              onClick={() => setIsOpen(false)}
              className="mt-2 font-black px-8"
              style={{ background: PURPLE, color: WHITE }}
            >
              Ver Cardápio
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-3 rounded-2xl border"
                  style={{ borderColor: BORDER }}
                >
                  {/* Item icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: "oklch(0.96 0.01 305)" }}
                  >
                    🍇
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate" style={{ color: DARK }}>
                      {item.productName}
                    </p>
                    <p className="text-sm font-bold" style={{ color: PURPLE }}>
                      R$ {(item.unitPrice * item.quantity).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center border-2 font-bold transition-colors hover:bg-purple-50"
                      style={{ borderColor: PURPLE, color: PURPLE }}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-black text-sm" style={{ color: DARK }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white transition-opacity hover:opacity-80"
                      style={{ background: PURPLE }}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-red-50"
                    style={{ color: "oklch(0.55 0.22 25)" }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div
              className="p-4 space-y-3 border-t"
              style={{ borderColor: BORDER }}
            >
              <div className="flex justify-between items-center px-1">
                <span className="font-bold text-base" style={{ color: GRAY }}>
                  Total do pedido
                </span>
                <span
                  className="font-black text-2xl"
                  style={{ color: PURPLE, fontFamily: "Nunito, sans-serif" }}
                >
                  R$ {totalAmount.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full font-black text-base py-6 rounded-2xl shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: PURPLE, color: WHITE }}
              >
                Finalizar Pedido →
              </Button>
              <p className="text-xs text-center font-semibold" style={{ color: GRAY }}>
                Sem taxa de cadastro. Rápido e fácil!
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
