import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Plus, Minus, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PURPLE = "oklch(0.38 0.22 305)";
const PURPLE_LIGHT = "oklch(0.94 0.04 305)";
const GOLD = "oklch(0.77 0.19 90)";
const GOLD_LIGHT = "oklch(0.97 0.04 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";
const GREEN = "oklch(0.55 0.18 145)";

type SelectedAddonMap = Record<number, Set<number>>; // categoryId → Set<addonId>

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "0");
  const [, navigate] = useLocation();
  const { addItem, setIsOpen } = useCart();

  const { data: product, isLoading, error } = trpc.addons.getProduct.useQuery(
    { productId },
    { enabled: productId > 0 }
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddonMap>({});
  const [notes, setNotes] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Inicializar categorias expandidas quando produto carregar
  const allCategoryIds = useMemo(
    () => product?.addonCategories.map((c) => c.id) ?? [],
    [product]
  );

  // Expandir todas as categorias por padrão
  const effectiveExpanded = useMemo(() => {
    if (expandedCategories.size === 0 && allCategoryIds.length > 0) {
      return new Set(allCategoryIds);
    }
    return expandedCategories;
  }, [expandedCategories, allCategoryIds]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev.size === 0 ? allCategoryIds : prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const toggleAddon = (categoryId: number, addonId: number, maxSelect: number) => {
    setSelectedAddons((prev) => {
      const catSet = new Set(prev[categoryId] ?? []);
      if (catSet.has(addonId)) {
        catSet.delete(addonId);
      } else {
        if (maxSelect === 1) {
          // Radio: substitui seleção
          catSet.clear();
          catSet.add(addonId);
        } else {
          // Checkbox: adiciona se não exceder máximo
          if (catSet.size < maxSelect) {
            catSet.add(addonId);
          } else {
            toast.error(`Máximo de ${maxSelect} opções para esta categoria.`);
            return prev;
          }
        }
      }
      return { ...prev, [categoryId]: catSet };
    });
  };

  const isAddonSelected = (categoryId: number, addonId: number) =>
    selectedAddons[categoryId]?.has(addonId) ?? false;

  // Calcular total dos adicionais selecionados
  const addonsTotal = useMemo(() => {
    if (!product) return 0;
    let total = 0;
    for (const cat of product.addonCategories) {
      const selected = selectedAddons[cat.id];
      if (!selected) continue;
      for (const addon of cat.addons) {
        if (selected.has(addon.id)) {
          total += parseFloat(addon.price);
        }
      }
    }
    return total;
  }, [product, selectedAddons]);

  // Validar obrigatórios
  const missingRequired = useMemo(() => {
    if (!product) return [];
    return product.addonCategories
      .filter((cat) => cat.required)
      .filter((cat) => {
        const selected = selectedAddons[cat.id];
        return !selected || selected.size < cat.minSelect;
      })
      .map((cat) => cat.name);
  }, [product, selectedAddons]);

  const unitPrice = product ? parseFloat(product.price) : 0;
  const itemTotal = (unitPrice + addonsTotal) * quantity;

  const handleAddToCart = () => {
    if (!product) return;
    if (missingRequired.length > 0) {
      toast.error(`Selecione os obrigatórios: ${missingRequired.join(", ")}`);
      return;
    }

    // Montar lista de adicionais selecionados
    const flatAddons: { addonId: number; addonName: string; price: number }[] = [];
    for (const cat of product.addonCategories) {
      const selected = selectedAddons[cat.id];
      if (!selected) continue;
      for (const addon of cat.addons) {
        if (selected.has(addon.id)) {
          flatAddons.push({
            addonId: addon.id,
            addonName: addon.name,
            price: parseFloat(addon.price),
          });
        }
      }
    }

    // Adicionar ao carrinho `quantity` vezes (ou usar quantity no item)
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        productName: product.name,
        unitPrice,
        selectedAddons: flatAddons,
        addonsTotal,
        notes,
      });
    }

    toast.success(`${product.name} adicionado ao carrinho!`, { duration: 2000 });
    setIsOpen(true);
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: WHITE }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="rounded-full animate-spin border-4"
            style={{ borderColor: PURPLE, borderTopColor: "transparent", width: 48, height: 48 }}
          />
          <p className="font-bold text-sm" style={{ color: GRAY }}>Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: WHITE }}>
        <div className="text-5xl">😕</div>
        <p className="font-black text-xl text-center" style={{ color: DARK }}>Produto não encontrado</p>
        <Button onClick={() => navigate("/")} style={{ background: PURPLE, color: WHITE }}>
          Voltar ao Cardápio
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: WHITE }}>
      {/* Hero com foto ou placeholder */}
      <div className="relative" style={{ minHeight: 280 }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full object-cover"
            style={{ height: 280 }}
          />
        ) : (
          <div
            className="w-full flex items-center justify-center"
            style={{ height: 280, background: `linear-gradient(135deg, ${PURPLE} 0%, oklch(0.55 0.22 305) 100%)` }}
          >
            <span style={{ fontSize: 96 }}>🍇</span>
          </div>
        )}
        {/* Overlay gradiente no fundo da imagem */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 80, background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }}
        />
        {/* Botão voltar */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 rounded-full flex items-center justify-center shadow-lg transition-all hover:opacity-90 active:scale-95"
          style={{ background: WHITE, width: 44, height: 44 }}
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: PURPLE }} />
        </button>
        {/* Badge categoria */}
        <div className="absolute top-4 right-4">
          <span
            className="text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide shadow"
            style={{ background: GOLD, color: DARK }}
          >
            {product.category}
          </span>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col" style={{ padding: "0 0 120px 0" }}>
        {/* Nome e preço */}
        <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: BORDER }}>
          <h1
            className="font-black text-2xl leading-tight"
            style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
          >
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-2 text-sm font-semibold leading-relaxed" style={{ color: GRAY }}>
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="font-black text-2xl" style={{ color: PURPLE, fontFamily: "Nunito, sans-serif" }}>
              R$ {unitPrice.toFixed(2).replace(".", ",")}
            </span>
            {addonsTotal > 0 && (
              <span className="text-sm font-bold" style={{ color: GREEN }}>
                + R$ {addonsTotal.toFixed(2).replace(".", ",")} em adicionais
              </span>
            )}
          </div>
        </div>

        {/* Categorias de adicionais */}
        {product.addonCategories.map((cat) => {
          const isExpanded = effectiveExpanded.has(cat.id);
          const selectedCount = selectedAddons[cat.id]?.size ?? 0;

          return (
            <div key={cat.id} className="border-b" style={{ borderColor: BORDER }}>
              {/* Header da categoria */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:opacity-80"
                style={{ background: isExpanded ? PURPLE_LIGHT : WHITE }}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base" style={{ color: DARK }}>
                      {cat.name}
                    </span>
                    {cat.required && (
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: PURPLE, color: WHITE }}
                      >
                        Obrigatório
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: GRAY }}>
                    {cat.maxSelect === 1
                      ? "Escolha 1 opção"
                      : `Escolha até ${cat.maxSelect} opções`}
                    {selectedCount > 0 && (
                      <span style={{ color: GREEN }}> · {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {selectedCount > 0 && (
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: GREEN, color: WHITE }}
                    >
                      ✓
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" style={{ color: GRAY }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: GRAY }} />
                  )}
                </div>
              </button>

              {/* Lista de adicionais */}
              {isExpanded && (
                <div className="px-5 pb-3 space-y-2">
                  {cat.addons.length === 0 ? (
                    <p className="text-sm font-semibold py-2" style={{ color: GRAY }}>
                      Nenhum adicional disponível nesta categoria.
                    </p>
                  ) : (
                    cat.addons.map((addon) => {
                      const selected = isAddonSelected(cat.id, addon.id);
                      const addonPrice = parseFloat(addon.price);

                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(cat.id, addon.id, cat.maxSelect)}
                          className="w-full flex items-center gap-3 rounded-2xl border-2 transition-all active:scale-[0.98]"
                          style={{
                            borderColor: selected ? PURPLE : BORDER,
                            background: selected ? PURPLE_LIGHT : WHITE,
                            padding: "12px 14px",
                          }}
                        >
                          {/* Indicador radio/checkbox */}
                          <div
                            className="flex-shrink-0 flex items-center justify-center border-2 transition-all"
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: cat.maxSelect === 1 ? "50%" : 6,
                              borderColor: selected ? PURPLE : BORDER,
                              background: selected ? PURPLE : WHITE,
                            }}
                          >
                            {selected && (
                              <div
                                style={{
                                  width: cat.maxSelect === 1 ? 8 : 12,
                                  height: cat.maxSelect === 1 ? 8 : 12,
                                  borderRadius: cat.maxSelect === 1 ? "50%" : 2,
                                  background: WHITE,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 10,
                                  fontWeight: 900,
                                }}
                              >
                                {cat.maxSelect > 1 ? "✓" : ""}
                              </div>
                            )}
                          </div>

                          <span className="flex-1 text-left font-bold text-sm" style={{ color: DARK }}>
                            {addon.name}
                          </span>

                          {addonPrice > 0 ? (
                            <span
                              className="text-sm font-black flex-shrink-0"
                              style={{ color: selected ? PURPLE : GRAY }}
                            >
                              + R$ {addonPrice.toFixed(2).replace(".", ",")}
                            </span>
                          ) : (
                            <span className="text-xs font-bold flex-shrink-0" style={{ color: GREEN }}>
                              Grátis
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Observações */}
        <div className="px-5 py-4 border-b" style={{ borderColor: BORDER }}>
          <p className="font-black text-base mb-2" style={{ color: DARK }}>
            Alguma observação?
          </p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: sem granola, açaí bem gelado, capricha na granola..."
            className="rounded-2xl border-2 font-semibold text-sm resize-none"
            style={{ borderColor: BORDER, color: DARK, minHeight: 80 }}
            maxLength={200}
          />
          <p className="text-xs mt-1 text-right font-semibold" style={{ color: GRAY }}>
            {notes.length}/200
          </p>
        </div>
      </div>

      {/* Barra fixa de CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t"
        style={{ background: WHITE, borderColor: BORDER, padding: "12px 16px 20px" }}
      >
        {/* Seletor de quantidade */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-black text-base" style={{ color: DARK }}>Quantidade</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="rounded-full border-2 flex items-center justify-center font-bold transition-colors hover:bg-purple-50 active:scale-95"
              style={{ borderColor: PURPLE, color: PURPLE, width: 40, height: 40 }}
              aria-label="Diminuir"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-black text-xl" style={{ color: DARK, minWidth: 28, textAlign: "center" }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="rounded-full flex items-center justify-center font-bold text-white transition-opacity hover:opacity-80 active:scale-95"
              style={{ background: PURPLE, width: 40, height: 40 }}
              aria-label="Aumentar"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Botão adicionar ao carrinho */}
        <Button
          onClick={handleAddToCart}
          disabled={missingRequired.length > 0}
          className="w-full font-black text-base rounded-2xl shadow-lg transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-between"
          style={{
            background: missingRequired.length > 0 ? GRAY : PURPLE,
            color: WHITE,
            minHeight: 56,
            padding: "0 20px",
          }}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Adicionar ao Carrinho</span>
          </div>
          <span
            className="font-black text-base px-3 py-1 rounded-xl"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            R$ {itemTotal.toFixed(2).replace(".", ",")}
          </span>
        </Button>

        {missingRequired.length > 0 && (
          <p className="text-xs text-center mt-2 font-bold" style={{ color: "oklch(0.55 0.22 25)" }}>
            Selecione: {missingRequired.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
