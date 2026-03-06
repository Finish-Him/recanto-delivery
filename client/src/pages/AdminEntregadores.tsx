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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Bike, Loader2, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const PURPLE = "oklch(0.38 0.22 305)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";
const GREEN = "oklch(0.55 0.18 145)";

type DeliveryPerson = {
  id: number;
  name: string;
  phone: string;
  pin: string;
  active: boolean;
};

type FormData = {
  name: string;
  phone: string;
  pin: string;
  active: boolean;
};

const emptyForm: FormData = { name: "", phone: "", pin: "", active: true };

export default function AdminEntregadores() {
  const utils = trpc.useUtils();
  const { data: persons = [], isLoading } = trpc.delivery.list.useQuery();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryPerson | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [showPin, setShowPin] = useState(false);

  const createMutation = trpc.delivery.create.useMutation({
    onSuccess: () => {
      toast.success("Entregador cadastrado!");
      utils.delivery.list.invalidate();
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (err) => toast.error("Erro ao cadastrar", { description: err.message }),
  });

  const updateMutation = trpc.delivery.update.useMutation({
    onSuccess: () => {
      toast.success("Entregador atualizado!");
      utils.delivery.list.invalidate();
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (err) => toast.error("Erro ao atualizar", { description: err.message }),
  });

  const toggleMutation = trpc.delivery.update.useMutation({
    onMutate: async ({ id, active }) => {
      await utils.delivery.list.cancel();
      const prev = utils.delivery.list.getData();
      utils.delivery.list.setData(undefined, (old) =>
        old?.map((p) => (p.id === id ? { ...p, active: active ?? p.active } : p))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.delivery.list.setData(undefined, ctx.prev);
      toast.error("Erro ao alterar status");
    },
    onSettled: () => utils.delivery.list.invalidate(),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowPin(false);
    setDialogOpen(true);
  }

  function openEdit(person: DeliveryPerson) {
    setEditing(person);
    setForm({ name: person.name, phone: person.phone, pin: person.pin, active: person.active });
    setShowPin(false);
    setDialogOpen(true);
  }

  function generatePin() {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    setForm((f) => ({ ...f, pin }));
    setShowPin(true);
  }

  function copyPin(pin: string) {
    navigator.clipboard.writeText(pin);
    toast.success("PIN copiado!");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.pin.trim()) {
      toast.error("Nome, telefone e PIN são obrigatórios.");
      return;
    }
    if (form.pin.length < 4) {
      toast.error("PIN deve ter no mínimo 4 dígitos.");
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: PURPLE }}
            >
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="font-black text-2xl leading-tight"
                style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
              >
                Entregadores
              </h1>
              <p className="text-sm font-semibold" style={{ color: GRAY }}>
                {persons.length} entregador{persons.length !== 1 ? "es" : ""} cadastrado{persons.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/entregador/login"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold px-4 py-2 rounded-xl border-2 transition-colors"
              style={{ borderColor: BORDER, color: GRAY }}
            >
              Ver área do entregador
            </a>
            <Button
              onClick={openCreate}
              className="font-black rounded-xl text-white gap-2"
              style={{ background: PURPLE }}
            >
              <Plus className="w-4 h-4" />
              Novo Entregador
            </Button>
          </div>
        </div>

        {/* Instrução de acesso */}
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: "oklch(0.95 0.03 305)", border: `1.5px solid oklch(0.85 0.06 305)` }}
        >
          <Bike className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: PURPLE }} />
          <div>
            <p className="font-black text-sm" style={{ color: DARK }}>
              Como funciona o acesso do entregador
            </p>
            <p className="font-semibold text-sm mt-1" style={{ color: GRAY }}>
              Cada entregador acessa o dashboard em{" "}
              <strong style={{ color: PURPLE }}>/entregador/login</strong> usando o PIN cadastrado aqui.
              Compartilhe o PIN e o link com o entregador pelo WhatsApp.
            </p>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          style={{ border: `1.5px solid ${BORDER}` }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: PURPLE }} />
            </div>
          ) : persons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Bike className="w-12 h-12" style={{ color: BORDER }} />
              <p className="font-bold text-base" style={{ color: GRAY }}>
                Nenhum entregador cadastrado
              </p>
              <Button
                onClick={openCreate}
                variant="outline"
                className="font-bold rounded-xl border-2 bg-transparent"
                style={{ borderColor: PURPLE, color: PURPLE }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar primeiro entregador
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ background: "oklch(0.97 0.01 305)" }}>
                  <TableHead className="font-black text-xs uppercase tracking-wide" style={{ color: GRAY }}>
                    Nome
                  </TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-wide" style={{ color: GRAY }}>
                    Telefone
                  </TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-wide" style={{ color: GRAY }}>
                    PIN
                  </TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-wide text-center" style={{ color: GRAY }}>
                    Ativo
                  </TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-wide text-right" style={{ color: GRAY }}>
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {persons.map((person) => (
                  <TableRow
                    key={person.id}
                    className="transition-colors hover:bg-purple-50/30"
                    style={{ opacity: person.active ? 1 : 0.55 }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm text-white"
                          style={{ background: PURPLE }}
                        >
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm" style={{ color: DARK }}>
                          {person.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-sm" style={{ color: GRAY }}>
                        {person.phone}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-black text-base tracking-widest"
                          style={{ color: PURPLE, fontFamily: "Nunito, sans-serif" }}
                        >
                          {person.pin}
                        </span>
                        <button
                          onClick={() => copyPin(person.pin)}
                          className="p-1 rounded-lg transition-colors hover:bg-purple-50"
                          title="Copiar PIN"
                        >
                          <Copy className="w-3.5 h-3.5" style={{ color: GRAY }} />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={person.active}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ id: person.id, active: checked })
                        }
                        className="data-[state=checked]:bg-purple-700"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(person)}
                        className="font-bold rounded-lg border-2 bg-transparent gap-1.5"
                        style={{ borderColor: BORDER, color: GRAY }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!isPending) setDialogOpen(open); }}>
        <DialogContent className="max-w-md" style={{ background: WHITE }}>
          <DialogHeader>
            <DialogTitle
              className="font-black text-xl"
              style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
            >
              {editing ? "Editar Entregador" : "Novo Entregador"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>
                Nome *
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: João da Silva"
                required
                className="font-semibold rounded-xl"
                style={{ borderColor: BORDER }}
              />
            </div>

            <div>
              <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>
                Telefone (WhatsApp) *
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="21981749450"
                required
                className="font-semibold rounded-xl"
                style={{ borderColor: BORDER }}
              />
            </div>

            <div>
              <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>
                PIN de Acesso *
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={form.pin}
                    onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="4 a 6 dígitos"
                    type={showPin ? "text" : "password"}
                    required
                    className="font-black rounded-xl tracking-widest"
                    style={{ borderColor: BORDER }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPin ? (
                      <EyeOff className="w-4 h-4" style={{ color: GRAY }} />
                    ) : (
                      <Eye className="w-4 h-4" style={{ color: GRAY }} />
                    )}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePin}
                  className="font-bold rounded-xl border-2 bg-transparent flex-shrink-0"
                  style={{ borderColor: BORDER, color: GRAY }}
                >
                  Gerar PIN
                </Button>
              </div>
              <p className="text-xs font-semibold mt-1" style={{ color: GRAY }}>
                O entregador usa este PIN para acessar o dashboard.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "oklch(0.97 0.01 305)" }}>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => setForm({ ...form, active: checked })}
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
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isPending}
                className="font-bold rounded-xl border-2 bg-transparent"
                style={{ borderColor: BORDER, color: GRAY }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="font-black rounded-xl text-white"
                style={{ background: PURPLE }}
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : editing ? (
                  "Salvar Alterações"
                ) : (
                  "Cadastrar Entregador"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
