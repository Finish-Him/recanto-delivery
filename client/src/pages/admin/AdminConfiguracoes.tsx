import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Store, Clock, MapPin, Truck, Phone, Globe,
  ChevronDown, ChevronUp, Loader2, CheckCircle2
} from "lucide-react";

const PURPLE = "oklch(0.38 0.22 305)";
const PURPLE_DARK = "oklch(0.28 0.20 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";
const BG = "oklch(0.97 0.01 305)";

// Configurações padrão — chave, label, valor inicial
const DEFAULT_SETTINGS: {
  key: string;
  label: string;
  defaultValue: string;
  type?: "text" | "textarea" | "number" | "time" | "select";
  options?: string[];
  placeholder?: string;
  group: string;
  hint?: string;
}[] = [
  // ─── Informações da loja ───────────────────────────────────────────────────
  {
    key: "store_name",
    label: "Nome da loja",
    defaultValue: "Recanto do Açaí",
    type: "text",
    placeholder: "Ex: Recanto do Açaí",
    group: "Informações da Loja",
  },
  {
    key: "store_phone",
    label: "Telefone / WhatsApp",
    defaultValue: "(21) 98174-9450",
    type: "text",
    placeholder: "(21) 99999-9999",
    group: "Informações da Loja",
    hint: "Usado no botão de WhatsApp e notificações",
  },
  {
    key: "store_instagram",
    label: "Instagram",
    defaultValue: "",
    type: "text",
    placeholder: "@recantoaçai",
    group: "Informações da Loja",
  },
  // ─── Endereço ──────────────────────────────────────────────────────────────
  {
    key: "store_address",
    label: "Endereço completo",
    defaultValue: "",
    type: "textarea",
    placeholder: "Rua das Flores, 123 – Bairro – Cidade – RJ",
    group: "Endereço",
    hint: "Exibido no rodapé e na página de download do app",
  },
  {
    key: "store_neighborhood",
    label: "Bairro",
    defaultValue: "",
    type: "text",
    placeholder: "Ex: Centro",
    group: "Endereço",
  },
  {
    key: "store_city",
    label: "Cidade / Estado",
    defaultValue: "Rio de Janeiro – RJ",
    type: "text",
    placeholder: "Ex: Rio de Janeiro – RJ",
    group: "Endereço",
  },
  {
    key: "store_maps_url",
    label: "Link do Google Maps",
    defaultValue: "",
    type: "text",
    placeholder: "https://maps.google.com/?q=...",
    group: "Endereço",
    hint: "Link para o cliente abrir no Google Maps",
  },
  // ─── Horário de funcionamento ──────────────────────────────────────────────
  {
    key: "hours_weekdays",
    label: "Segunda a Sexta",
    defaultValue: "14:00 – 22:00",
    type: "text",
    placeholder: "14:00 – 22:00",
    group: "Horário de Funcionamento",
  },
  {
    key: "hours_saturday",
    label: "Sábado",
    defaultValue: "12:00 – 23:00",
    type: "text",
    placeholder: "12:00 – 23:00",
    group: "Horário de Funcionamento",
  },
  {
    key: "hours_sunday",
    label: "Domingo",
    defaultValue: "12:00 – 22:00",
    type: "text",
    placeholder: "12:00 – 22:00",
    group: "Horário de Funcionamento",
  },
  {
    key: "hours_holidays",
    label: "Feriados",
    defaultValue: "Fechado",
    type: "text",
    placeholder: "Fechado ou 14:00 – 20:00",
    group: "Horário de Funcionamento",
  },
  {
    key: "hours_display",
    label: "Tempo estimado de entrega",
    defaultValue: "30–45 min",
    type: "text",
    placeholder: "30–45 min",
    group: "Horário de Funcionamento",
    hint: "Exibido no cabeçalho do site para os clientes",
  },
  // ─── Entrega e preços ──────────────────────────────────────────────────────
  {
    key: "delivery_fee",
    label: "Taxa de entrega padrão (R$)",
    defaultValue: "4.90",
    type: "number",
    placeholder: "4.90",
    group: "Entrega e Preços",
    hint: "Valor cobrado automaticamente em todos os pedidos",
  },
  {
    key: "delivery_min_order",
    label: "Pedido mínimo (R$)",
    defaultValue: "0.00",
    type: "number",
    placeholder: "0.00",
    group: "Entrega e Preços",
    hint: "Deixe 0 para não ter pedido mínimo",
  },
  {
    key: "delivery_free_above",
    label: "Frete grátis acima de (R$)",
    defaultValue: "",
    type: "number",
    placeholder: "50.00",
    group: "Entrega e Preços",
    hint: "Deixe vazio para não oferecer frete grátis",
  },
  {
    key: "delivery_radius",
    label: "Raio de entrega",
    defaultValue: "",
    type: "text",
    placeholder: "Ex: 5 km",
    group: "Entrega e Preços",
  },
  // ─── Mensagens ─────────────────────────────────────────────────────────────
  {
    key: "msg_closed",
    label: "Mensagem quando fechado",
    defaultValue: "Estamos fechados no momento. Volte em breve!",
    type: "textarea",
    placeholder: "Estamos fechados no momento. Volte em breve!",
    group: "Mensagens",
  },
  {
    key: "msg_whatsapp_order",
    label: "Mensagem de confirmação WhatsApp",
    defaultValue: "Olá! Recebemos seu pedido e já estamos preparando. Em breve você receberá uma atualização.",
    type: "textarea",
    placeholder: "Mensagem enviada ao cliente após confirmação do pedido",
    group: "Mensagens",
    hint: "Enviada via WhatsApp quando o pedido é confirmado",
  },
];

const GROUPS = Array.from(new Set(DEFAULT_SETTINGS.map((s) => s.group)));

const GROUP_ICONS: Record<string, React.ReactNode> = {
  "Informações da Loja": <Store className="w-5 h-5" />,
  "Endereço": <MapPin className="w-5 h-5" />,
  "Horário de Funcionamento": <Clock className="w-5 h-5" />,
  "Entrega e Preços": <Truck className="w-5 h-5" />,
  "Mensagens": <Phone className="w-5 h-5" />,
};

export default function AdminConfiguracoes() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data: savedSettings, isLoading, refetch } = trpc.storeConfig.get.useQuery();
  const saveMutation = trpc.storeConfig.save.useMutation();

  // Estado local dos valores dos campos
  const [values, setValues] = useState<Record<string, string>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(GROUPS.map((g) => [g, true]))
  );
  const [saved, setSaved] = useState(false);

  // Preencher com valores salvos ou defaults
  useEffect(() => {
    const initial: Record<string, string> = {};
    DEFAULT_SETTINGS.forEach((s) => {
      initial[s.key] = savedSettings?.[s.key] ?? s.defaultValue;
    });
    setValues(initial);
  }, [savedSettings]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PURPLE }} />
      </div>
    );
  }

  if (!user || (user as any).role !== "admin") {
    navigate("/login");
    return null;
  }

  const handleSave = async () => {
    const entries = DEFAULT_SETTINGS.map((s) => ({
      key: s.key,
      value: values[s.key] ?? "",
      label: s.label,
    }));
    try {
      await saveMutation.mutateAsync({ settings: entries });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success("Configurações salvas com sucesso!");
      refetch();
    } catch {
      toast.error("Erro ao salvar configurações.");
    }
  };

  const toggleGroup = (group: string) =>
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));

  return (
    <div className="min-h-screen animate-page-enter" style={{ background: BG }}>
      {/* Header */}
      <header className="sticky top-0 z-10 shadow-sm" style={{ background: PURPLE }}>
        <div className="container flex items-center justify-between" style={{ minHeight: 64 }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center justify-center rounded-full transition-all active:scale-95"
              style={{ background: "oklch(0.32 0.20 305)", color: WHITE, width: 44, height: 44 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5" style={{ color: GOLD }} />
              <h1 className="font-black text-lg" style={{ color: WHITE, fontFamily: "Nunito, sans-serif" }}>
                Configurações da Loja
              </h1>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{ background: saved ? "oklch(0.55 0.18 145)" : GOLD, color: DARK }}
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </header>

      <div className="container py-6 pb-20 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-32 rounded-2xl animate-pulse" style={{ background: "oklch(0.92 0.02 305)" }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {GROUPS.map((group) => {
              const groupSettings = DEFAULT_SETTINGS.filter((s) => s.group === group);
              const isOpen = openGroups[group];
              return (
                <div
                  key={group}
                  className="rounded-2xl overflow-hidden shadow-sm"
                  style={{ background: WHITE, border: `2px solid ${BORDER}` }}
                >
                  {/* Group header */}
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:opacity-90"
                    style={{ background: isOpen ? "oklch(0.96 0.03 305)" : WHITE }}
                    onClick={() => toggleGroup(group)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: PURPLE, color: WHITE }}
                      >
                        {GROUP_ICONS[group] ?? <Globe className="w-5 h-5" />}
                      </div>
                      <span className="font-black text-base" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
                        {group}
                      </span>
                    </div>
                    {isOpen
                      ? <ChevronUp className="w-5 h-5" style={{ color: GRAY }} />
                      : <ChevronDown className="w-5 h-5" style={{ color: GRAY }} />
                    }
                  </button>

                  {/* Group fields */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 flex flex-col gap-4">
                      {groupSettings.map((setting) => (
                        <div key={setting.key} className="flex flex-col gap-1.5">
                          <label
                            className="text-sm font-black"
                            style={{ color: DARK }}
                            htmlFor={setting.key}
                          >
                            {setting.label}
                          </label>
                          {setting.hint && (
                            <p className="text-xs font-semibold" style={{ color: GRAY }}>
                              {setting.hint}
                            </p>
                          )}
                          {setting.type === "textarea" ? (
                            <textarea
                              id={setting.key}
                              value={values[setting.key] ?? ""}
                              onChange={(e) =>
                                setValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
                              }
                              placeholder={setting.placeholder}
                              rows={3}
                              className="w-full rounded-xl px-4 py-3 text-sm font-semibold resize-none outline-none transition-all focus:ring-2"
                              style={{
                                border: `2px solid ${BORDER}`,
                                color: DARK,
                                background: "oklch(0.98 0.01 305)",
                              }}
                            />
                          ) : (
                            <input
                              id={setting.key}
                              type={setting.type === "number" ? "number" : "text"}
                              value={values[setting.key] ?? ""}
                              onChange={(e) =>
                                setValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
                              }
                              placeholder={setting.placeholder}
                              step={setting.type === "number" ? "0.01" : undefined}
                              min={setting.type === "number" ? "0" : undefined}
                              className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all focus:ring-2"
                              style={{
                                border: `2px solid ${BORDER}`,
                                color: DARK,
                                background: "oklch(0.98 0.01 305)",
                                minHeight: 48,
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Botão salvar no final */}
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center justify-center gap-2 w-full rounded-2xl font-black text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-2"
              style={{ background: PURPLE, color: WHITE, minHeight: 56 }}
            >
              {saveMutation.isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</>
              ) : saved ? (
                <><CheckCircle2 className="w-5 h-5" /> Configurações salvas!</>
              ) : (
                <><Save className="w-5 h-5" /> Salvar todas as configurações</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
