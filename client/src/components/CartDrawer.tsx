import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";

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
        className="w-full sm:max-w-md flex flex-col"
        style={{ background: "oklch(0.99 0 0)" }}
      >
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="font-display text-xl font-bold uppercase flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: "oklch(0.52 0.19 25)" }} />
            Seu Carrinho
            {totalItems > 0 && (
              <span
                className="ml-auto text-sm font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: "oklch(0.52 0.19 25)" }}
              >
                {totalItems}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.94 0.04 55)" }}
            >
              <ShoppingBag className="w-10 h-10" style={{ color: "oklch(0.52 0.19 25)" }} />
            </div>
            <p className="font-bold text-lg" style={{ color: "oklch(0.12 0 0)" }}>
              Carrinho vazio
            </p>
            <p className="text-sm" style={{ color: "oklch(0.45 0.02 55)" }}>
              Adicione itens do cardápio para começar seu pedido!
            </p>
            <Button
              onClick={() => setIsOpen(false)}
              className="mt-2 font-bold uppercase"
              style={{ background: "oklch(0.52 0.19 25)", color: "white" }}
            >
              Ver Cardápio
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ borderColor: "oklch(0.80 0.05 55)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "oklch(0.12 0 0)" }}>
                      {item.productName}
                    </p>
                    <p className="text-sm font-semibold" style={{ color: "oklch(0.52 0.19 25)" }}>
                      R$ {(item.unitPrice * item.quantity).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center border font-bold transition-colors hover:bg-gray-100"
                      style={{ borderColor: "oklch(0.80 0.05 55)" }}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold transition-opacity hover:opacity-80"
                      style={{ background: "oklch(0.52 0.19 25)" }}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-red-50"
                    style={{ color: "oklch(0.52 0.22 25)" }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div
              className="border-t pt-4 space-y-3"
              style={{ borderColor: "oklch(0.80 0.05 55)" }}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg" style={{ color: "oklch(0.12 0 0)" }}>
                  Total
                </span>
                <span
                  className="font-black text-2xl"
                  style={{ color: "oklch(0.52 0.19 25)", fontFamily: "Syne, sans-serif" }}
                >
                  R$ {totalAmount.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full font-bold uppercase text-base py-6 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                style={{ background: "oklch(0.52 0.19 25)", color: "white" }}
              >
                Finalizar Pedido
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
