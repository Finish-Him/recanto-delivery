import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Users,
  UtensilsCrossed,
  BarChart3,
  Settings,
  Package,
  Bike,
  ChevronRight,
  Menu,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { toast } from "sonner";

// ─── Paleta ─────────────────────────────────────────────────────────────────
const PURPLE      = "oklch(0.38 0.22 305)";
const PURPLE_DARK = "oklch(0.28 0.22 305)";
const PURPLE_MID  = "oklch(0.48 0.20 305)";
const PURPLE_SOFT = "oklch(0.92 0.04 305)";
const GOLD        = "oklch(0.77 0.19 90)";
const GOLD_SOFT   = "oklch(0.95 0.06 90)";
const WHITE       = "oklch(0.99 0 0)";
const DARK        = "oklch(0.12 0 0)";

// ─── Ícones personalizados (CDN) ─────────────────────────────────────────────
const CUSTOM_ICONS: Record<string, string> = {
  pedidos:       "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/icon-pedidos-5F6JBY4pcn9QR9DkrBgQop.webp",
  cardapio:      "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/icon-menu-cardapio-gARLtAU9b8fzatRMEbaeN6.webp",
  entregadores:  "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/icon-delivery-moto-jD3KPenStzgjwad7AzBPPB.webp",
  clientes:      "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/icon-clientes-WssdPo2Qmj53TAXCU5e8yK.webp",
  relatorios:    "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/icon-relatorios-C8JRbZ8Y9KKoE7GuigfCqb.webp",
  logo:          "https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/logo-recanto-app-BiGZ2DoJqLYmsEJWh6h9pU.webp",
};

// ─── Cores por grupo ─────────────────────────────────────────────────────────
const groupColors: Record<string, { accent: string; iconColor: string; bg: string }> = {
  "Operações": { accent: GOLD,        iconColor: DARK,   bg: GOLD_SOFT },
  "Gestão":    { accent: PURPLE_MID,  iconColor: WHITE,  bg: PURPLE_SOFT },
  "Análise":   { accent: "oklch(0.52 0.18 200)", iconColor: WHITE, bg: "oklch(0.94 0.04 200)" },
  "Sistema":   { accent: "oklch(0.52 0.05 305)", iconColor: WHITE, bg: "oklch(0.94 0.02 305)" },
};

type MenuItem = { icon: React.ElementType; label: string; path: string; placeholder?: boolean; customIcon?: string };
type MenuGroup = { title: string; items: MenuItem[] };

const menuGroups: MenuGroup[] = [
  {
    title: "Operações",
    items: [
      { icon: LayoutDashboard, label: "Pedidos", path: "/admin", customIcon: CUSTOM_ICONS.pedidos },
    ],
  },
  {
    title: "Gestão",
    items: [
      { icon: UtensilsCrossed, label: "Cardápio",      path: "/admin/cardapio",      customIcon: CUSTOM_ICONS.cardapio },
      { icon: Users,           label: "Clientes",      path: "/admin/clientes",      customIcon: CUSTOM_ICONS.clientes,  placeholder: true },
      { icon: Package,         label: "Estoque",       path: "/admin/estoque",        placeholder: true },
    ],
  },
  {
    title: "Análise",
    items: [
      { icon: BarChart3, label: "Relatórios", path: "/admin/relatorios", customIcon: CUSTOM_ICONS.relatorios },
    ],
  },
  {
    title: "Sistema",
    items: [
      { icon: Settings, label: "Configurações", path: "/admin/configuracoes", placeholder: true },
    ],
  },
];

const menuItems = menuGroups.flatMap((g) => g.items);

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 380;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: PURPLE_SOFT }}>
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <h1 className="text-2xl font-black tracking-tight text-center" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
            Acesso Restrito
          </h1>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            size="lg"
            className="w-full font-black"
            style={{ background: PURPLE, color: WHITE }}
          >
            Entrar com Manus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayoutContent setSidebarWidth={setSidebarWidth} sidebarWidth={sidebarWidth}>
      {children}
    </DashboardLayoutContent>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
  sidebarWidth: number;
};

function DashboardLayoutContent({ children, setSidebarWidth, sidebarWidth }: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find((item) => item.path === location);
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const SidebarContent = (
    <div
      className="flex flex-col h-full"
      style={{ background: PURPLE_DARK }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 h-16 border-b shrink-0"
        style={{ borderColor: "oklch(0.35 0.18 305)" }}
      >
        <button
          onClick={() => collapsed ? setCollapsed(false) : setCollapsed(true)}
          className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors shrink-0 focus:outline-none"
          style={{ background: "oklch(0.32 0.18 305)" }}
          aria-label="Toggle navigation"
        >
          <PanelLeft className="h-4 w-4" style={{ color: GOLD }} />
        </button>
        {collapsed ? (
          <img
            src={CUSTOM_ICONS.logo}
            alt="Recanto do Açaí"
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={CUSTOM_ICONS.logo}
              alt="Recanto do Açaí"
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
            <span
              className="font-black text-sm tracking-tight truncate"
              style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}
            >
              Recanto do Açaí
            </span>
          </div>
        )}
      </div>

      {/* Menu groups */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        {menuGroups.map((group) => {
          const gc = groupColors[group.title] ?? groupColors["Sistema"];
          return (
            <div key={group.title} className="px-2">
              {/* Group label */}
              {!collapsed && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 mb-1 rounded-lg"
                  style={{ background: "oklch(0.32 0.18 305)" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: gc.accent }}
                  />
                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: gc.accent }}
                  >
                    {group.title}
                  </span>
                </div>
              )}

              {/* Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        if (item.placeholder) {
                          toast("Em breve", { description: `${item.label} estará disponível em breve.` });
                          return;
                        }
                        setLocation(item.path);
                        if (isMobile) setMobileOpen(false);
                      }}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 rounded-xl transition-all focus:outline-none ${
                        collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
                      }`}
                      style={{
                        background: isActive ? gc.accent : "transparent",
                        color: isActive ? (gc.iconColor === WHITE ? WHITE : DARK) : "oklch(0.78 0.05 305)",
                        opacity: item.placeholder ? 0.55 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.34 0.18 305)";
                          (e.currentTarget as HTMLButtonElement).style.color = WHITE;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.78 0.05 305)";
                        }
                      }}
                    >
                      {item.customIcon ? (
                        <img
                          src={item.customIcon}
                          alt={item.label}
                          className="shrink-0 rounded-md"
                          style={{ width: 22, height: 22, objectFit: "contain",
                            filter: isActive ? "brightness(0) invert(1)" : "none",
                            opacity: isActive ? 1 : 0.85,
                          }}
                        />
                      ) : (
                        <item.icon
                          className="shrink-0"
                          style={{
                            width: 16,
                            height: 16,
                            color: isActive ? (gc.iconColor === WHITE ? WHITE : DARK) : gc.accent,
                          }}
                        />
                      )}
                      {!collapsed && (
                        <>
                          <span className="font-bold text-sm flex-1 text-left truncate">
                            {item.label}
                          </span>
                          {item.placeholder ? (
                            <span
                              className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                              style={{ background: "oklch(0.32 0.18 305)", color: "oklch(0.65 0.08 305)" }}
                            >
                              breve
                            </span>
                          ) : isActive ? (
                            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                          ) : null}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / user */}
      <div
        className="shrink-0 p-3 border-t"
        style={{ borderColor: "oklch(0.35 0.18 305)" }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors w-full text-left focus:outline-none ${
                collapsed ? "justify-center px-0" : ""
              }`}
              style={{ background: "oklch(0.32 0.18 305)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.36 0.18 305)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.32 0.18 305)"; }}
            >
              <Avatar className="h-8 w-8 shrink-0 border-2" style={{ borderColor: GOLD }}>
                <AvatarFallback
                  className="text-xs font-black"
                  style={{ background: GOLD, color: DARK }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate leading-none" style={{ color: WHITE }}>
                    {user?.name || "-"}
                  </p>
                  <p className="text-xs truncate mt-1" style={{ color: "oklch(0.65 0.08 305)" }}>
                    Admin
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div
          className="flex items-center justify-between h-14 px-4 border-b sticky top-0 z-40"
          style={{ background: PURPLE_DARK, borderColor: "oklch(0.35 0.18 305)" }}
        >
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="h-9 w-9 flex items-center justify-center rounded-lg"
            style={{ background: "oklch(0.32 0.18 305)" }}
          >
            <Menu className="h-5 w-5" style={{ color: GOLD }} />
          </button>
          <span className="font-black text-sm" style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}>
            {activeMenuItem?.label ?? "Painel Admin"}
          </span>
          <div className="w-9" />
        </div>

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="w-72 h-full shadow-2xl"
              style={{ background: PURPLE_DARK }}
            >
              {SidebarContent}
            </div>
            <div
              className="flex-1 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        )}

        <main className="flex-1 p-4">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="relative shrink-0 h-screen sticky top-0"
        style={{
          width: collapsed ? 64 : sidebarWidth,
          transition: isResizing ? "none" : "width 0.2s ease",
        }}
      >
        <div className="h-full overflow-hidden">
          {SidebarContent}
        </div>

        {/* Resize handle */}
        {!collapsed && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize transition-colors hover:bg-purple-400/30"
            onMouseDown={() => setIsResizing(true)}
            style={{ zIndex: 50 }}
          />
        )}
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 p-4 overflow-auto">{children}</main>
    </div>
  );
}
