import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useState, useCallback } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminCardapio from "./pages/AdminCardapio";
import AdminRelatorios from "./pages/AdminRelatorios";
import OrderTracking from "./pages/OrderTracking";
import Register from "./pages/Register";
import AppDownload from "./pages/AppDownload";
import ProductDetail from "./pages/ProductDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/cardapio" component={AdminCardapio} />
      <Route path="/admin/relatorios" component={AdminRelatorios} />
      <Route path="/login" component={AdminLogin} />
      <Route path="/pedido/:id" component={OrderTracking} />
      <Route path="/cadastro" component={Register} />
      <Route path="/app" component={AppDownload} />
      <Route path="/instalar" component={AppDownload} />
      <Route path="/produto/:id" component={ProductDetail} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <CartProvider>
            <Toaster />
            {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
            <Router />
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
