import React, { createContext, useContext, useState, useCallback } from "react";

export type SelectedAddon = {
  addonId: number;
  addonName: string;
  price: number;
};

export type CartItem = {
  cartItemId: string;          // UUID único para permitir mesmo produto com adicionais diferentes
  productId: number;
  productName: string;
  unitPrice: number;           // preço base do produto
  quantity: number;
  selectedAddons: SelectedAddon[];  // adicionais selecionados
  addonsTotal: number;         // soma dos preços dos adicionais
  notes: string;               // observações livres
};

export const DELIVERY_FEE = 4.90;

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "cartItemId">) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;  // subtotal sem frete
  grandTotal: number;   // subtotal + frete
  deliveryFee: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity" | "cartItemId">) => {
    setItems((prev) => {
      // Verifica se já existe item idêntico (mesmo produto + mesmos adicionais + mesmas observações)
      const addonKey = newItem.selectedAddons.map((a) => a.addonId).sort().join(",");
      const existing = prev.find(
        (i) =>
          i.productId === newItem.productId &&
          i.selectedAddons.map((a) => a.addonId).sort().join(",") === addonKey &&
          i.notes === newItem.notes
      );
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === existing.cartItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: 1, cartItemId: generateId() }];
    });
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce(
    (sum, i) => sum + (i.unitPrice + i.addonsTotal) * i.quantity,
    0
  );
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const grandTotal = totalAmount + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        grandTotal,
        deliveryFee,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
