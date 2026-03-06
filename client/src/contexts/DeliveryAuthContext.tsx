import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type DeliverySession = {
  id: number;
  name: string;
  phone: string;
};

type DeliveryAuthContextType = {
  session: DeliverySession | null;
  login: (session: DeliverySession) => void;
  logout: () => void;
};

const STORAGE_KEY = "delivery_session";

const DeliveryAuthContext = createContext<DeliveryAuthContextType>({
  session: null,
  login: () => {},
  logout: () => {},
});

export function DeliveryAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DeliverySession | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (data: DeliverySession) => {
    setSession(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DeliveryAuthContext.Provider value={{ session, login, logout }}>
      {children}
    </DeliveryAuthContext.Provider>
  );
}

export function useDeliveryAuth() {
  return useContext(DeliveryAuthContext);
}
