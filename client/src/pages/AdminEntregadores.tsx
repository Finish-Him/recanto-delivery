import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Bike,
  Plus,
  Pencil,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  Phone,
  IdCard,
  Calendar,
  Clock,
  FileText,
  ShoppingBag,
  TrendingUp,
  BadgeCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ─── Design tokens ─────────────────────────────────────────────────────────
const PURPLE      = "oklch(0.38 0.22 305)";
const PURPLE_SOFT = "oklch(0.95 0.04 305)";
const GOLD        = "oklch(0.77 0.19 90)";
const GOLD_SOFT   = "oklch(0.97 0.04 90)";
const WHITE       = "oklch(0.99 0 0)";
const DARK        = "oklch(0.12 0 0)";
const GRAY        = "oklch(0.50 0.03 305)";
const BORDER      = "oklch(0.88 0.04 305)";
const GREEN       = "oklch(0.52 0.18 145)";
const GREEN_SOFT  = "oklch(0.94 0.04 145)";
const RED         = "oklch(0.52 0.22 25)";
const RED_SOFT    = "oklch(0.97 0.02 25)";

const SHIFT_MAP: Record<string, { label: string; bg: string; color: string }> = {
  manha:    { label: "Manhã",    bg: GOLD_SOFT,   color: DARK },
  tarde:    { label: "Tarde",    bg: "oklch(0.92 0.06 220)", color: "oklch(0.30 0.18 220)" },
  noite:    { label: "Noite",    bg: PURPLE_SOFT, color: PURPLE },
  integral: { label: "Integral", bg: GREEN_SOFT,  color: GREEN },
};

// ─── Types ─────────────────────────────────────────────────────────────────
type DeliveryPerson = {
  id: number;
  name: string;
  phone: string;
  pin: string;
  cpf?: string | null;
  shift?: string | null;
  hiredAt?: string | null;
  notes?: string | null;
  active: boolean;
  createdAt: Date;
};

type FormData = {
  name: string;
  phone: string;
  pin: string;
  cpf: string;
  shift: "manha" | "tarde" | "noite" | "integral";
  hiredAt: string;
  notes: string;
  active: boolean;
};

function makeEmptyForm(): FormData {
  return {
    name: "", phone: "", pin: String(Math.floor(1000 + Math.random() * 9000)),
    cpf: "", shift: "integral", hiredAt: "", notes: "", active: true,
  };
}

// ─── Expandable card ───────────────────────────────────────────────────────
function PersonCard({
  person,
  onEdit,
  onToggle,
}: {
  person: DeliveryPerson;
  onEdit: (p: DeliveryPerson) => void;
  onToggle: (id: number, active: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);

  const { data: stats } = trpc.delivery.stats.useQuery({ id: person.id }, { enabled: expanded });
  const { data: history } = trpc.delivery.orderHistory.useQuery({ id: person.id }, { enabled: expanded });

  const shift = SHIFT_MAP[person.shift ?? "integral"] ?? SHIFT_MAP.integral;

  function copyPin() {
    navigator.clipboard.writeText(person.pin);
    setPinCopied(true);
    toast.success("PIN copiado!");
    setTimeout(() => setPinCopied(false), 2000);
  }

  return (
    <div
      className="rounded-2xl border-2 overflow-hidden transition-shadow hover:shadow-md"
      style={{ borderColor: person.active ? BORDER : "oklch(0.90 0.02 25)", background: WHITE, opacity: person.active ? 1 : 0.75 }}
    >
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          {/* Avatar + info */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
              style={{ background: person.active ? PURPLE : BORDER, color: WHITE }}
            >
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-base" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
                  {person.name}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: shift.bg, color: shift.color }}>
                  {shift.label}
                </span>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: person.active ? GREEN_SOFT : RED_SOFT, color: person.active ? GREEN : RED }}
                >
                  {person.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold" style={{ color: GRAY }}>
                <Phone className="w-3 h-3" /> {person.phone}
              </div>
              {person.cpf && (
                <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold" style={{ color: GRAY }}>
                  <IdCard className="w-3 h-3" /> {person.cpf}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* PIN badge */}
            <button
              onClick={copyPin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all"
              style={{ borderColor: GOLD, background: GOLD_SOFT, color: DARK }}
              title="Copiar PIN"
            >
              {pinCopied ? <BadgeCheck className="w-3.5 h-3.5" style={{ color: GREEN }} /> : <Copy className="w-3.5 h-3.5" />}
              PIN: {person.pin}
            </button>
            <button
              onClick={() => onEdit(person)}
              className="px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all"
              style={{ borderColor: PURPLE_SOFT, background: PURPLE_SOFT, color: PURPLE }}
            >
              <Pencil className="w-3.5 h-3.5 inline mr-1" />Editar
            </button>
            <button
              onClick={() => onToggle(person.id, !person.active)}
              className="px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all"
              style={{
                borderColor: person.active ? "oklch(0.88 0.04 25)" : "oklch(0.88 0.06 145)",
                background: person.active ? RED_SOFT : GREEN_SOFT,
                color: person.active ? RED : GREEN,
              }}
            >
              {person.active ? "Desativar" : "Ativar"}
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 mt-3">
          {person.hiredAt && (
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: GRAY }}>
              <Calendar className="w-3.5 h-3.5" />
              Admissão: {new Date(person.hiredAt + "T00:00:00").toLocaleDateString("pt-BR")}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: GRAY }}>
            <Clock className="w-3.5 h-3.5" />
            Cadastrado em {new Date(person.createdAt).toLocaleDateString("pt-BR")}
          </span>
        </div>

        {person.notes && (
          <div className="mt-3 px-3 py-2 rounded-xl text-xs font-semibold italic" style={{ background: PURPLE_SOFT, color: GRAY }}>
            <FileText className="w-3.5 h-3.5 inline mr-1.5" />{person.notes}
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-black transition-all"
          style={{ background: PURPLE_SOFT, color: PURPLE }}
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Ocultar métricas" : "Ver métricas e histórico"}
        </button>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t-2 p-4 space-y-4" style={{ borderColor: BORDER, background: "oklch(0.98 0.01 305)" }}>
          {/* Stats */}
          {stats ? (
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ShoppingBag, label: "Entregas", value: String(stats.totalDeliveries), color: PURPLE },
                { icon: TrendingUp, label: "Faturado", value: `R$ ${stats.totalRevenue.toFixed(2).replace(".", ",")}`, color: GREEN },
                { icon: BadgeCheck, label: "Ticket médio", value: `R$ ${stats.avgTicket.toFixed(2).replace(".", ",")}`, color: GOLD },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl p-3 text-center border-2" style={{ background: WHITE, borderColor: BORDER }}>
                  <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
                  <div className="font-black text-lg leading-tight" style={{ color: DARK }}>{value}</div>
                  <div className="text-[10px] font-bold uppercase mt-0.5" style={{ color: GRAY }}>{label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-xl p-3 animate-pulse border-2" style={{ background: WHITE, borderColor: BORDER, height: 80 }} />
              ))}
            </div>
          )}

          {/* Order history */}
          <div>
            <p className="font-black text-xs uppercase tracking-wide mb-2" style={{ color: GRAY }}>
              Últimos pedidos entregues
            </p>
            {!history ? (
              <div className="space-y-2">
                {[1, 2].map((n) => <div key={n} className="h-10 rounded-xl animate-pulse" style={{ background: BORDER }} />)}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-4 text-xs font-semibold" style={{ color: GRAY }}>
                Nenhum pedido entregue ainda.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.slice(0, 10).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold border"
                    style={{ background: WHITE, borderColor: BORDER, color: DARK }}
                  >
                    <span className="font-black" style={{ color: PURPLE }}>#{order.id}</span>
                    <span className="truncate flex-1 mx-2">{order.customerName}</span>
                    <span style={{ color: GRAY }}>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
                    <span className="ml-2 font-black" style={{ color: GREEN }}>
                      R$ {parseFloat(order.totalAmount).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Form dialog ───────────────────────────────────────────────────────────
function PersonFormDialog({
  open,
  onClose,
  editPerson,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editPerson: DeliveryPerson | null;
  onSaved: () => void;
}) {
  const isEdit = !!editPerson;
  const [form, setForm] = useState<FormData>(() =>
    editPerson
      ? {
          name: editPerson.name,
          phone: editPerson.phone,
          pin: editPerson.pin,
          cpf: editPerson.cpf ?? "",
          shift: (editPerson.shift as FormData["shift"]) ?? "integral",
          hiredAt: editPerson.hiredAt ?? "",
          notes: editPerson.notes ?? "",
          active: editPerson.active,
        }
      : makeEmptyForm()
  );
  const [showPin, setShowPin] = useState(false);

  const create = trpc.delivery.create.useMutation({
    onSuccess: () => { toast.success("Entregador cadastrado!"); onSaved(); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.delivery.update.useMutation({
    onSuccess: () => { toast.success("Dados atualizados!"); onSaved(); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  const isPending = create.isPending || update.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.pin.length < 4) { toast.error("PIN deve ter no mínimo 4 dígitos."); return; }
    if (isEdit && editPerson) {
      update.mutate({
        id: editPerson.id,
        name: form.name, phone: form.phone, pin: form.pin,
        cpf: form.cpf || null, shift: form.shift,
        hiredAt: form.hiredAt || null, notes: form.notes || null, active: form.active,
      });
    } else {
      create.mutate({
        name: form.name, phone: form.phone, pin: form.pin,
        cpf: form.cpf || undefined, shift: form.shift,
        hiredAt: form.hiredAt || undefined, notes: form.notes || undefined, active: form.active,
      });
    }
  }

  const fieldClass = "font-semibold rounded-xl";
  const labelClass = "block font-bold text-sm mb-1.5";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) { if (!v) onClose(); } }}>
      <DialogContent className="max-w-lg" style={{ background: WHITE }}>
        <DialogHeader>
          <DialogTitle className="font-black text-xl" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
            {isEdit ? "Editar Entregador" : "Novo Entregador"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nome */}
          <div>
            <Label className={labelClass} style={{ color: DARK }}>Nome completo *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: João da Silva"
              required className={fieldClass} style={{ borderColor: BORDER }}
            />
          </div>

          {/* Telefone + CPF */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass} style={{ color: DARK }}>Telefone (WhatsApp) *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="21981749450"
                required className={fieldClass} style={{ borderColor: BORDER }}
              />
            </div>
            <div>
              <Label className={labelClass} style={{ color: DARK }}>CPF</Label>
              <Input
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                placeholder="000.000.000-00"
                className={fieldClass} style={{ borderColor: BORDER }}
              />
            </div>
          </div>

          {/* PIN + Turno */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass} style={{ color: DARK }}>PIN de acesso *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={form.pin}
                    onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="4–6 dígitos"
                    type={showPin ? "text" : "password"}
                    required className={`${fieldClass} tracking-widest`} style={{ borderColor: BORDER }}
                  />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPin ? <EyeOff className="w-4 h-4" style={{ color: GRAY }} /> : <Eye className="w-4 h-4" style={{ color: GRAY }} />}
                  </button>
                </div>
                <Button
                  type="button" variant="outline"
                  onClick={() => { setForm({ ...form, pin: String(Math.floor(1000 + Math.random() * 9000)) }); setShowPin(true); }}
                  className="font-bold rounded-xl border-2 bg-transparent shrink-0"
                  style={{ borderColor: GOLD, color: DARK, background: GOLD_SOFT }}
                  title="Gerar PIN aleatório"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className={labelClass} style={{ color: DARK }}>Turno</Label>
              <select
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value as FormData["shift"] })}
                className="w-full font-semibold rounded-xl border-2 px-3 py-2 text-sm outline-none"
                style={{ borderColor: BORDER, background: WHITE, color: DARK }}
              >
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
                <option value="integral">Integral</option>
              </select>
            </div>
          </div>

          {/* Data de admissão */}
          <div>
            <Label className={labelClass} style={{ color: DARK }}>Data de admissão</Label>
            <Input
              type="date"
              value={form.hiredAt}
              onChange={(e) => setForm({ ...form, hiredAt: e.target.value })}
              className={fieldClass} style={{ borderColor: BORDER }}
            />
          </div>

          {/* Observações */}
          <div>
            <Label className={labelClass} style={{ color: DARK }}>Observações internas</Label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Informações internas sobre o entregador..."
              rows={2}
              className="w-full font-semibold rounded-xl border-2 px-3 py-2 text-sm outline-none resize-none"
              style={{ borderColor: BORDER, background: WHITE, color: DARK }}
            />
          </div>

          {/* Ativo toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "oklch(0.97 0.01 305)" }}>
            <Switch
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
              className="data-[state=checked]:bg-purple-700"
            />
            <div>
              <p className="font-bold text-sm" style={{ color: DARK }}>
                {form.active ? "Entregador ativo" : "Entregador inativo"}
              </p>
              <p className="text-xs font-semibold" style={{ color: GRAY }}>
                Entregadores inativos não conseguem fazer login.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button" variant="outline" onClick={onClose} disabled={isPending}
              className="font-bold rounded-xl border-2 bg-transparent" style={{ borderColor: BORDER, color: GRAY }}
            >
              Cancelar
            </Button>
            <Button
              type="submit" disabled={isPending}
              className="font-black rounded-xl text-white" style={{ background: PURPLE }}
            >
              {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : isEdit ? "Salvar Alterações" : "Cadastrar Entregador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function AdminEntregadores() {
  const utils = trpc.useUtils();
  const { data: persons = [], isLoading, refetch } = trpc.delivery.list.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPerson, setEditPerson] = useState<DeliveryPerson | null>(null);
  const [filter, setFilter] = useState<"todos" | "ativos" | "inativos">("todos");

  const toggleMutation = trpc.delivery.update.useMutation({
    onMutate: async ({ id, active }) => {
      await utils.delivery.list.cancel();
      const prev = utils.delivery.list.getData();
      utils.delivery.list.setData(undefined, (old) =>
        old?.map((p) => (p.id === id ? { ...p, active: active ?? p.active } : p))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) utils.delivery.list.setData(undefined, ctx.prev);
      toast.error("Erro ao alterar status");
    },
    onSettled: () => utils.delivery.list.invalidate(),
  });

  function openNew() { setEditPerson(null); setDialogOpen(true); }
  function openEdit(p: DeliveryPerson) { setEditPerson(p); setDialogOpen(true); }

  const filtered = persons.filter((p) => {
    if (filter === "ativos") return p.active;
    if (filter === "inativos") return !p.active;
    return true;
  });

  const activeCount = persons.filter((p) => p.active).length;
  const inactiveCount = persons.filter((p) => !p.active).length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PURPLE }}>
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-2xl leading-tight" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
                Entregadores
              </h1>
              <p className="text-sm font-semibold" style={{ color: GRAY }}>
                Trabalhadores contratados da equipe
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/entregador/login" target="_blank" rel="noopener noreferrer"
              className="text-sm font-bold px-4 py-2 rounded-xl border-2 transition-colors"
              style={{ borderColor: BORDER, color: GRAY }}
            >
              Área do entregador ↗
            </a>
            <Button onClick={openNew} className="font-black rounded-xl text-white gap-2" style={{ background: PURPLE }}>
              <Plus className="w-4 h-4" /> Novo Entregador
            </Button>
          </div>
        </div>

        {/* Info banner */}
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: PURPLE_SOFT, border: `1.5px solid oklch(0.85 0.06 305)` }}>
          <Bike className="w-5 h-5 shrink-0 mt-0.5" style={{ color: PURPLE }} />
          <p className="font-semibold text-sm" style={{ color: GRAY }}>
            Cada entregador acessa em <strong style={{ color: PURPLE }}>/entregador/login</strong> usando o PIN cadastrado aqui.
            Compartilhe o link e o PIN pelo WhatsApp.
          </p>
        </div>

        {/* Filter tabs + stats */}
        <div className="grid grid-cols-3 gap-3">
          {([
            { key: "todos",    label: "Total",    count: persons.length, color: PURPLE, bg: PURPLE_SOFT },
            { key: "ativos",   label: "Ativos",   count: activeCount,    color: GREEN,  bg: GREEN_SOFT  },
            { key: "inativos", label: "Inativos", count: inactiveCount,  color: RED,    bg: RED_SOFT    },
          ] as const).map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className="rounded-2xl p-4 text-center border-2 transition-all hover:scale-105"
              style={{
                background: filter === s.key ? s.bg : WHITE,
                borderColor: filter === s.key ? s.color : BORDER,
              }}
            >
              <div className="font-black text-3xl" style={{ color: s.color }}>{s.count}</div>
              <div className="font-bold text-xs uppercase mt-0.5" style={{ color: GRAY }}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="rounded-2xl p-5 animate-pulse border-2" style={{ background: WHITE, borderColor: BORDER }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center border-2" style={{ background: WHITE, borderColor: BORDER }}>
            <Bike className="w-12 h-12 mx-auto mb-3" style={{ color: BORDER }} />
            <p className="font-bold text-lg" style={{ color: GRAY }}>
              {filter === "todos" ? "Nenhum entregador cadastrado" : `Nenhum entregador ${filter}`}
            </p>
            {filter === "todos" && (
              <Button onClick={openNew} className="mt-4 font-black gap-2" style={{ background: PURPLE, color: WHITE }}>
                <Plus className="w-4 h-4" /> Cadastrar primeiro entregador
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <PersonCard
                key={p.id}
                person={p as DeliveryPerson}
                onEdit={openEdit}
                onToggle={(id, active) => toggleMutation.mutate({ id, active })}
              />
            ))}
          </div>
        )}
      </div>

      <PersonFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditPerson(null); }}
        editPerson={editPerson}
        onSaved={() => refetch()}
      />
    </DashboardLayout>
  );
}
