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
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalAmount, grandTotal, deliveryFee, totalItems } =
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
        {/* Header roxo — altura 64px */}
        <SheetHeader
          className="flex-row items-center gap-3 flex-shrink-0"
          style={{ background: PURPLE, padding: "0 20px", minHeight: 64 }}
        >
          <div
            className="rounded-full overflow-hidden border-2 flex-shrink-0"
            style={{ borderColor: GOLD, width: 40, height: 40 }}
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
              className="text-sm font-black px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ background: GOLD, color: DARK }}
            >
              {totalItems} {totalItems === 1 ? "item" : "itens"}
            </span>
          )}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <div
              className="rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.96 0.01 305)", width: 96, height: 96 }}
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
              className="mt-2 font-black px-8 rounded-xl"
              style={{ background: PURPLE, color: WHITE, minHeight: 48 }}
            >
              Ver Cardápio
            </Button>
          </div>
        ) : (
          <>
            {/* Lista de itens com scroll */}
            <div className="flex-1 overflow-y-auto" style={{ padding: "12px 16px" }}>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-start gap-3 rounded-2xl border"
                    style={{ borderColor: BORDER, padding: "12px" }}
                  >
                    {/* Emoji ícone */}
                    <div
                      className="rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: "oklch(0.96 0.01 305)", width: 48, height: 48 }}
                    >
                      🍇
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm leading-tight truncate" style={{ color: DARK }}>
                        {item.productName}
                      </p>
                      {/* Adicionais selecionados */}
                      {item.selectedAddons.length > 0 && (
                        <p className="text-xs font-semibold mt-0.5 leading-snug" style={{ color: GRAY }}>
                          + {item.selectedAddons.map((a) => a.addonName).join(", ")}
                        </p>
                      )}
                      {/* Observações */}
                      {item.notes && (
                        <p className="text-xs italic mt-0.5 leading-snug" style={{ color: GRAY }}>
                          Obs: {item.notes}
                        </p>
                      )}
                      <p className="text-sm font-bold mt-1" style={{ color: PURPLE }}>
                        R$ {((item.unitPrice + item.addonsTotal) * item.quantity).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    {/* Controles de quantidade — botões 40x40px */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="rounded-full border-2 flex items-center justify-center font-bold transition-colors hover:bg-purple-50 active:scale-95"
                          style={{ borderColor: PURPLE, color: PURPLE, width: 32, height: 32 }}
                          aria-label="Diminuir"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span
                          className="font-black text-base text-center"
                          style={{ color: DARK, minWidth: 20 }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="rounded-full flex items-center justify-center font-bold text-white transition-opacity hover:opacity-80 active:scale-95"
                          style={{ background: PURPLE, width: 32, height: 32 }}
                          aria-label="Aumentar"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      {/* Botão remover */}
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="rounded-full flex items-center justify-center transition-colors hover:bg-red-50 active:scale-95"
                        style={{ color: "oklch(0.55 0.22 25)", width: 32, height: 32 }}
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rodapé com totais e botão */}
            <div
              className="flex-shrink-0 space-y-3 border-t"
              style={{ borderColor: BORDER, padding: "16px" }}
            >
              <div className="space-y-2 px-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm" style={{ color: GRAY }}>Subtotal</span>
                  <span className="font-bold text-sm" style={{ color: GRAY }}>
                    R$ {totalAmount.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm" style={{ color: GRAY }}>Taxa de entrega</span>
                  <span className="font-bold text-sm" style={{ color: GRAY }}>
                    R$ {deliveryFee.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center pt-2 border-t"
                  style={{ borderColor: BORDER }}
                >
                  <span className="font-black text-base" style={{ color: DARK }}>Total</span>
                  <span
                    className="font-black text-2xl"
                    style={{ color: PURPLE, fontFamily: "Nunito, sans-serif" }}
                  >
                    R$ {grandTotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
              {/* Botão finalizar — altura 56px para fácil toque */}
              <Button
                onClick={handleCheckout}
                className="w-full font-black text-base rounded-2xl shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: PURPLE, color: WHITE, minHeight: 56 }}
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
