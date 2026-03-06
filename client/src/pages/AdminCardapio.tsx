import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, UtensilsCrossed, Loader2, ImageOff } from "lucide-react";
import { toast } from "sonner";

const PURPLE = "oklch(0.38 0.22 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  category: string | null;
  available: boolean;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  available: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  category: "açaí",
  available: true,
};

export default function AdminCardapio() {
  const utils = trpc.useUtils();
  const { data: products = [], isLoading } = trpc.products.listAdmin.useQuery();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      utils.products.listAdmin.invalidate();
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (err) => toast.error("Erro ao criar produto", { description: err.message }),
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado!");
      utils.products.listAdmin.invalidate();
      setDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (err) => toast.error("Erro ao atualizar produto", { description: err.message }),
  });

  const toggleMutation = trpc.products.toggleAvailability.useMutation({
    onMutate: async ({ id, available }) => {
      await utils.products.listAdmin.cancel();
      const prev = utils.products.listAdmin.getData();
      utils.products.listAdmin.setData(undefined, (old) =>
        old?.map((p) => (p.id === id ? { ...p, available } : p))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) utils.products.listAdmin.setData(undefined, ctx.prev);
      toast.error("Erro ao alterar disponibilidade");
    },
    onSettled: () => utils.products.listAdmin.invalidate(),
  });

  function openCreate() {
    setEditingProduct(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      imageUrl: product.imageUrl ?? "",
      category: product.category ?? "açaí",
      available: product.available,
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim()) {
      toast.error("Nome e preço são obrigatórios.");
      return;
    }
    const priceNum = parseFloat(form.price.replace(",", "."));
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Preço inválido.");
      return;
    }
    const priceStr = priceNum.toFixed(2);

    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct.id,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: priceStr,
        imageUrl: form.imageUrl.trim() || null,
        category: form.category.trim() || "açaí",
        available: form.available,
      });
    } else {
      createMutation.mutate({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: priceStr,
        imageUrl: form.imageUrl.trim() || undefined,
        category: form.category.trim() || "açaí",
        available: form.available,
      });
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
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="font-black text-2xl leading-tight"
                style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
              >
                Cardápio
              </h1>
              <p className="text-sm font-semibold" style={{ color: GRAY }}>
                {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            onClick={openCreate}
            className="font-black rounded-xl text-white gap-2"
            style={{ background: PURPLE }}
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </Button>
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
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <UtensilsCrossed className="w-12 h-12" style={{ color: BORDER }} />
              <p className="font-bold text-base" style={{ color: GRAY }}>
                Nenhum produto cadastrado
              </p>
              <Button
                onClick={openCreate}
                variant="outline"
                className="font-bold rounded-xl border-2 bg-transparent"
                style={{ borderColor: PURPLE, color: PURPLE }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar primeiro produto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ background: "oklch(0.97 0.01 305)" }}>
                  <TableHead className="font-black text-xs uppercase tracking-wide" style={{ color: GRAY }}>
                    Produto
                  </TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-wide" style={{ color: GRAY }}>
                    Categoria
                  </TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-wide text-right" style={{ color: GRAY }}>
                    Preço
                  </TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-wide text-center" style={{ color: GRAY }}>
                    Disponível
                  </TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-wide text-right" style={{ color: GRAY }}>
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="transition-colors hover:bg-purple-50/30"
                    style={{ opacity: product.available ? 1 : 0.55 }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* Thumbnail ou placeholder */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                          style={{ background: "oklch(0.94 0.03 305)", border: `1px solid ${BORDER}` }}
                        >
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageOff className="w-4 h-4" style={{ color: GRAY }} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: DARK }}>
                            {product.name}
                          </p>
                          {product.description && (
                            <p
                              className="text-xs font-semibold truncate max-w-[200px]"
                              style={{ color: GRAY }}
                            >
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-bold text-xs capitalize"
                        style={{ background: "oklch(0.94 0.03 305)", color: PURPLE }}
                      >
                        {product.category ?? "açaí"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-black text-base" style={{ color: PURPLE, fontFamily: "Nunito, sans-serif" }}>
                        R$ {parseFloat(product.price).toFixed(2).replace(".", ",")}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={product.available}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ id: product.id, available: checked })
                        }
                        className="data-[state=checked]:bg-purple-700"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(product)}
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

      {/* Dialog: Criar / Editar produto */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!isPending) setDialogOpen(open); }}>
        <DialogContent className="max-w-lg" style={{ background: WHITE }}>
          <DialogHeader>
            <DialogTitle
              className="font-black text-xl"
              style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}
            >
              {editingProduct ? "Editar Produto" : "Novo Produto"}
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
                placeholder="Ex: Açaí Tradicional 500ml"
                required
                className="font-semibold rounded-xl"
                style={{ borderColor: BORDER }}
              />
            </div>

            <div>
              <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>
                Descrição
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descreva o produto (ingredientes, tamanho...)"
                className="font-semibold resize-none rounded-xl"
                rows={2}
                style={{ borderColor: BORDER }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>
                  Preço (R$) *
                </Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="18,90"
                  required
                  className="font-semibold rounded-xl"
                  style={{ borderColor: BORDER }}
                />
              </div>
              <div>
                <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>
                  Categoria
                </Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="açaí"
                  className="font-semibold rounded-xl"
                  style={{ borderColor: BORDER }}
                />
              </div>
            </div>

            <div>
              <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>
                URL da Imagem
              </Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://... (deixe vazio para sem imagem)"
                className="font-semibold rounded-xl"
                style={{ borderColor: BORDER }}
              />
              <p className="text-xs font-semibold mt-1" style={{ color: GRAY }}>
                Cole a URL de uma imagem hospedada externamente.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "oklch(0.97 0.01 305)" }}>
              <Switch
                checked={form.available}
                onCheckedChange={(checked) => setForm({ ...form, available: checked })}
                className="data-[state=checked]:bg-purple-700"
              />
              <div>
                <p className="font-bold text-sm" style={{ color: DARK }}>
                  {form.available ? "Disponível no cardápio" : "Indisponível (oculto)"}
                </p>
                <p className="text-xs font-semibold" style={{ color: GRAY }}>
                  Produtos indisponíveis não aparecem para os clientes.
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
                ) : editingProduct ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Produto"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
