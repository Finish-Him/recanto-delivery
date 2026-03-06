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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  UtensilsCrossed,
  Loader2,
  ImageOff,
  Settings2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

const PURPLE = "oklch(0.38 0.22 305)";
const PURPLE_LIGHT = "oklch(0.94 0.04 305)";
const GOLD = "oklch(0.77 0.19 90)";
const WHITE = "oklch(0.99 0 0)";
const DARK = "oklch(0.12 0 0)";
const GRAY = "oklch(0.45 0.03 305)";
const BORDER = "oklch(0.88 0.04 305)";
const GREEN = "oklch(0.55 0.18 145)";
const RED = "oklch(0.55 0.22 25)";

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

type AddonCategory = {
  id: number;
  productId: number;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  addons: Addon[];
};

type Addon = {
  id: number;
  categoryId: number;
  name: string;
  price: string;
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

const emptyCatForm = {
  name: "",
  required: false,
  minSelect: 0,
  maxSelect: 1,
};

const emptyAddonForm = {
  name: "",
  price: "0",
};

export default function AdminCardapio() {
  const utils = trpc.useUtils();
  const { data: products = [], isLoading } = trpc.products.listAdmin.useQuery();

  // ── Produto dialog ──────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  // ── Adicionais sheet ────────────────────────────────────────────────────────
  const [addonsProduct, setAddonsProduct] = useState<Product | null>(null);
  const [addonsOpen, setAddonsOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());

  // Categoria dialog
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<AddonCategory | null>(null);
  const [catForm, setCatForm] = useState(emptyCatForm);

  // Addon dialog
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [addonCategoryId, setAddonCategoryId] = useState<number | null>(null);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [addonForm, setAddonForm] = useState(emptyAddonForm);

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: addonCategories = [], isLoading: catsLoading } =
    trpc.addons.listCategories.useQuery(
      { productId: addonsProduct?.id ?? 0 },
      { enabled: !!addonsProduct }
    );

  // ── Mutations: produto ───────────────────────────────────────────────────────
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado!");
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

  // ── Mutations: categorias ────────────────────────────────────────────────────
  const createCatMutation = trpc.addons.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada!");
      utils.addons.listCategories.invalidate();
      setCatDialogOpen(false);
      setCatForm(emptyCatForm);
    },
    onError: (err) => toast.error("Erro", { description: err.message }),
  });

  const updateCatMutation = trpc.addons.updateCategory.useMutation({
    onSuccess: () => {
      toast.success("Categoria atualizada!");
      utils.addons.listCategories.invalidate();
      setCatDialogOpen(false);
      setEditingCat(null);
    },
    onError: (err) => toast.error("Erro", { description: err.message }),
  });

  const deleteCatMutation = trpc.addons.deleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Categoria removida!");
      utils.addons.listCategories.invalidate();
    },
    onError: (err) => toast.error("Erro", { description: err.message }),
  });

  // ── Mutations: adicionais ────────────────────────────────────────────────────
  const createAddonMutation = trpc.addons.createAddon.useMutation({
    onSuccess: () => {
      toast.success("Adicional criado!");
      utils.addons.listCategories.invalidate();
      setAddonDialogOpen(false);
      setAddonForm(emptyAddonForm);
    },
    onError: (err) => toast.error("Erro", { description: err.message }),
  });

  const updateAddonMutation = trpc.addons.updateAddon.useMutation({
    onSuccess: () => {
      toast.success("Adicional atualizado!");
      utils.addons.listCategories.invalidate();
      setAddonDialogOpen(false);
      setEditingAddon(null);
    },
    onError: (err) => toast.error("Erro", { description: err.message }),
  });

  const deleteAddonMutation = trpc.addons.deleteAddon.useMutation({
    onSuccess: () => {
      toast.success("Adicional removido!");
      utils.addons.listCategories.invalidate();
    },
    onError: (err) => toast.error("Erro", { description: err.message }),
  });

  // ── Handlers: produto ────────────────────────────────────────────────────────
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

  // ── Handlers: adicionais ─────────────────────────────────────────────────────
  function openAddons(product: Product) {
    setAddonsProduct(product);
    setAddonsOpen(true);
    setExpandedCats(new Set());
  }

  function toggleCat(id: number) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCreateCat() {
    setEditingCat(null);
    setCatForm(emptyCatForm);
    setCatDialogOpen(true);
  }

  function openEditCat(cat: AddonCategory) {
    setEditingCat(cat);
    setCatForm({
      name: cat.name,
      required: cat.required,
      minSelect: cat.minSelect,
      maxSelect: cat.maxSelect,
    });
    setCatDialogOpen(true);
  }

  function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!catForm.name.trim()) {
      toast.error("Nome da categoria é obrigatório.");
      return;
    }
    if (editingCat) {
      updateCatMutation.mutate({
        id: editingCat.id,
        name: catForm.name.trim(),
        required: catForm.required,
        minSelect: catForm.minSelect,
        maxSelect: catForm.maxSelect,
      });
    } else {
      if (!addonsProduct) return;
      createCatMutation.mutate({
        productId: addonsProduct.id,
        name: catForm.name.trim(),
        required: catForm.required,
        minSelect: catForm.minSelect,
        maxSelect: catForm.maxSelect,
      });
    }
  }

  function openCreateAddon(categoryId: number) {
    setAddonCategoryId(categoryId);
    setEditingAddon(null);
    setAddonForm(emptyAddonForm);
    setAddonDialogOpen(true);
  }

  function openEditAddon(addon: Addon) {
    setAddonCategoryId(addon.categoryId);
    setEditingAddon(addon);
    setAddonForm({ name: addon.name, price: addon.price });
    setAddonDialogOpen(true);
  }

  function handleAddonSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addonForm.name.trim()) {
      toast.error("Nome do adicional é obrigatório.");
      return;
    }
    const priceNum = parseFloat(addonForm.price.replace(",", "."));
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Preço inválido.");
      return;
    }
    const priceStr = priceNum.toFixed(2);

    if (editingAddon) {
      updateAddonMutation.mutate({
        id: editingAddon.id,
        name: addonForm.name.trim(),
        price: priceStr,
      });
    } else {
      if (!addonCategoryId) return;
      createAddonMutation.mutate({
        categoryId: addonCategoryId,
        name: addonForm.name.trim(),
        price: priceStr,
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isCatPending = createCatMutation.isPending || updateCatMutation.isPending;
  const isAddonPending = createAddonMutation.isPending || updateAddonMutation.isPending;

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

        {/* Tabela de produtos */}
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
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                          style={{ background: "oklch(0.94 0.03 305)", border: `1px solid ${BORDER}` }}
                        >
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageOff className="w-4 h-4" style={{ color: GRAY }} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: DARK }}>
                            {product.name}
                          </p>
                          {product.description && (
                            <p className="text-xs font-semibold truncate max-w-[200px]" style={{ color: GRAY }}>
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
                      <div className="flex items-center justify-end gap-2">
                        {/* Botão Adicionais */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAddons(product)}
                          className="font-bold rounded-lg border-2 bg-transparent gap-1.5"
                          style={{ borderColor: GOLD, color: "oklch(0.55 0.19 90)" }}
                          title="Gerenciar adicionais"
                        >
                          <Tag className="w-3.5 h-3.5" />
                          Adicionais
                        </Button>
                        {/* Botão Editar */}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* ── Dialog: Criar / Editar produto ─────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!isPending) setDialogOpen(open); }}>
        <DialogContent className="max-w-lg" style={{ background: WHITE }}>
          <DialogHeader>
            <DialogTitle className="font-black text-xl" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>Nome *</Label>
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
              <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>Descrição</Label>
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
                <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>Preço (R$) *</Label>
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
                <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>Categoria</Label>
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
              <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>URL da Imagem</Label>
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
                ) : editingProduct ? "Salvar Alterações" : "Criar Produto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Sheet: Gerenciar Adicionais ─────────────────────────────────────── */}
      <Sheet open={addonsOpen} onOpenChange={setAddonsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl flex flex-col p-0 overflow-hidden"
          style={{ background: WHITE }}
        >
          <SheetHeader
            className="flex-row items-center gap-3 flex-shrink-0 border-b"
            style={{ background: PURPLE, padding: "0 20px", minHeight: 64, borderColor: "transparent" }}
          >
            <div
              className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", width: 40, height: 40 }}
            >
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="font-black text-base text-white leading-tight truncate">
                Adicionais
              </SheetTitle>
              <p className="text-xs font-semibold text-white/70 truncate">
                {addonsProduct?.name}
              </p>
            </div>
            <Button
              size="sm"
              onClick={openCreateCat}
              className="font-black rounded-xl gap-1.5 flex-shrink-0"
              style={{ background: GOLD, color: DARK, minHeight: 36 }}
            >
              <Plus className="w-4 h-4" />
              Nova Categoria
            </Button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto" style={{ padding: "16px" }}>
            {catsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: PURPLE }} />
              </div>
            ) : addonCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <Tag className="w-10 h-10" style={{ color: BORDER }} />
                <p className="font-bold text-base" style={{ color: GRAY }}>
                  Nenhuma categoria de adicionais
                </p>
                <p className="text-sm font-semibold" style={{ color: GRAY }}>
                  Crie categorias como "Complementos", "Coberturas", "Frutas", "Tamanho"...
                </p>
                <Button
                  onClick={openCreateCat}
                  className="mt-2 font-black rounded-xl text-white gap-2"
                  style={{ background: PURPLE }}
                >
                  <Plus className="w-4 h-4" />
                  Criar primeira categoria
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {(addonCategories as AddonCategory[]).map((cat) => {
                  const isExpanded = expandedCats.has(cat.id);
                  return (
                    <div
                      key={cat.id}
                      className="rounded-2xl border-2 overflow-hidden"
                      style={{ borderColor: BORDER }}
                    >
                      {/* Header da categoria */}
                      <div
                        className="flex items-center gap-3 px-4 py-3"
                        style={{ background: PURPLE_LIGHT }}
                      >
                        <button
                          onClick={() => toggleCat(cat.id)}
                          className="flex-1 flex items-center gap-2 text-left"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm" style={{ color: DARK }}>
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
                              {cat.maxSelect === 1 ? "Escolha 1" : `Até ${cat.maxSelect}`} •{" "}
                              {cat.addons.length} opção{cat.addons.length !== 1 ? "ões" : ""}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 ml-auto" style={{ color: GRAY }} />
                          ) : (
                            <ChevronDown className="w-4 h-4 ml-auto" style={{ color: GRAY }} />
                          )}
                        </button>
                        {/* Ações da categoria */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => openCreateAddon(cat.id)}
                            className="rounded-lg flex items-center justify-center transition-colors hover:bg-purple-100"
                            style={{ width: 32, height: 32, color: PURPLE }}
                            title="Adicionar opção"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditCat(cat)}
                            className="rounded-lg flex items-center justify-center transition-colors hover:bg-purple-100"
                            style={{ width: 32, height: 32, color: GRAY }}
                            title="Editar categoria"
                          >
                            <Settings2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remover categoria "${cat.name}" e todos seus adicionais?`)) {
                                deleteCatMutation.mutate({ id: cat.id });
                              }
                            }}
                            className="rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                            style={{ width: 32, height: 32, color: RED }}
                            title="Remover categoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Lista de adicionais */}
                      {isExpanded && (
                        <div className="divide-y" style={{ borderColor: BORDER }}>
                          {cat.addons.length === 0 ? (
                            <div className="px-4 py-3 text-center">
                              <p className="text-sm font-semibold" style={{ color: GRAY }}>
                                Nenhuma opção. Clique em{" "}
                                <button
                                  onClick={() => openCreateAddon(cat.id)}
                                  className="font-black underline"
                                  style={{ color: PURPLE }}
                                >
                                  + Adicionar
                                </button>
                              </p>
                            </div>
                          ) : (
                            cat.addons.map((addon) => (
                              <div
                                key={addon.id}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/50"
                              >
                                <span className="flex-1 font-semibold text-sm" style={{ color: DARK }}>
                                  {addon.name}
                                </span>
                                <span className="font-black text-sm" style={{ color: parseFloat(addon.price) > 0 ? PURPLE : GREEN }}>
                                  {parseFloat(addon.price) > 0
                                    ? `+ R$ ${parseFloat(addon.price).toFixed(2).replace(".", ",")}`
                                    : "Grátis"}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => openEditAddon(addon)}
                                    className="rounded-lg flex items-center justify-center hover:bg-purple-50"
                                    style={{ width: 28, height: 28, color: GRAY }}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remover "${addon.name}"?`)) {
                                        deleteAddonMutation.mutate({ id: addon.id });
                                      }
                                    }}
                                    className="rounded-lg flex items-center justify-center hover:bg-red-50"
                                    style={{ width: 28, height: 28, color: RED }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                          {/* Botão rápido de adicionar */}
                          <button
                            onClick={() => openCreateAddon(cat.id)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-purple-50/50"
                            style={{ color: PURPLE }}
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar opção
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Dialog: Criar / Editar Categoria ───────────────────────────────── */}
      <Dialog open={catDialogOpen} onOpenChange={(open) => { if (!isCatPending) setCatDialogOpen(open); }}>
        <DialogContent className="max-w-md" style={{ background: WHITE }}>
          <DialogHeader>
            <DialogTitle className="font-black text-xl" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
              {editingCat ? "Editar Categoria" : "Nova Categoria de Adicionais"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCatSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>
                Nome da Categoria *
              </Label>
              <Input
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="Ex: Complementos, Coberturas, Frutas, Tamanho..."
                required
                className="font-semibold rounded-xl"
                style={{ borderColor: BORDER }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>
                  Mínimo de seleções
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={catForm.minSelect}
                  onChange={(e) => setCatForm({ ...catForm, minSelect: parseInt(e.target.value) || 0 })}
                  className="font-semibold rounded-xl"
                  style={{ borderColor: BORDER }}
                />
              </div>
              <div>
                <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>
                  Máximo de seleções
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={catForm.maxSelect}
                  onChange={(e) => setCatForm({ ...catForm, maxSelect: parseInt(e.target.value) || 1 })}
                  className="font-semibold rounded-xl"
                  style={{ borderColor: BORDER }}
                />
              </div>
            </div>
            <p className="text-xs font-semibold -mt-2" style={{ color: GRAY }}>
              Máximo = 1 → radio (escolha única). Máximo &gt; 1 → checkbox (múltipla escolha).
            </p>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "oklch(0.97 0.01 305)" }}>
              <Switch
                checked={catForm.required}
                onCheckedChange={(checked) => setCatForm({ ...catForm, required: checked })}
                className="data-[state=checked]:bg-purple-700"
              />
              <div>
                <p className="font-bold text-sm" style={{ color: DARK }}>
                  {catForm.required ? "Seleção obrigatória" : "Seleção opcional"}
                </p>
                <p className="text-xs font-semibold" style={{ color: GRAY }}>
                  Obrigatório bloqueia o botão de adicionar ao carrinho.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCatDialogOpen(false)}
                disabled={isCatPending}
                className="font-bold rounded-xl border-2 bg-transparent"
                style={{ borderColor: BORDER, color: GRAY }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCatPending}
                className="font-black rounded-xl text-white"
                style={{ background: PURPLE }}
              >
                {isCatPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : editingCat ? "Salvar" : "Criar Categoria"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Criar / Editar Adicional ───────────────────────────────── */}
      <Dialog open={addonDialogOpen} onOpenChange={(open) => { if (!isAddonPending) setAddonDialogOpen(open); }}>
        <DialogContent className="max-w-sm" style={{ background: WHITE }}>
          <DialogHeader>
            <DialogTitle className="font-black text-xl" style={{ color: DARK, fontFamily: "Nunito, sans-serif" }}>
              {editingAddon ? "Editar Adicional" : "Novo Adicional"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddonSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>
                Nome *
              </Label>
              <Input
                value={addonForm.name}
                onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
                placeholder="Ex: Granola, Leite Ninho, Morango..."
                required
                className="font-semibold rounded-xl"
                style={{ borderColor: BORDER }}
              />
            </div>
            <div>
              <Label className="block font-bold text-sm mb-1.5" style={{ color: DARK }}>
                Preço adicional (R$)
              </Label>
              <Input
                value={addonForm.price}
                onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })}
                placeholder="0,00 para grátis"
                className="font-semibold rounded-xl"
                style={{ borderColor: BORDER }}
              />
              <p className="text-xs font-semibold mt-1" style={{ color: GRAY }}>
                Use 0 para adicionais sem custo extra.
              </p>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddonDialogOpen(false)}
                disabled={isAddonPending}
                className="font-bold rounded-xl border-2 bg-transparent"
                style={{ borderColor: BORDER, color: GRAY }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isAddonPending}
                className="font-black rounded-xl text-white"
                style={{ background: PURPLE }}
              >
                {isAddonPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : editingAddon ? "Salvar" : "Criar Adicional"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
