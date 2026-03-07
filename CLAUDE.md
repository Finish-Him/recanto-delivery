# CLAUDE.md — Contexto Técnico Completo: Recanto Delivery

> Este documento foi criado para permitir que o Claude (ou qualquer IA de desenvolvimento) assuma o projeto **Recanto Delivery** com contexto completo. Leia este arquivo inteiro antes de fazer qualquer alteração no código.

---

## 1. Visão Geral do Projeto

O **Recanto Delivery** é uma plataforma de delivery para o **Recanto do Açaí**, uma sorveteria especializada em açaí no Rio de Janeiro. A aplicação é um monorepo full-stack com frontend React e backend Express, comunicando-se exclusivamente via **tRPC** (sem REST manual).

O projeto foi desenvolvido e hospedado na plataforma **Manus** (manus.im), que gerencia automaticamente o servidor, banco de dados, autenticação OAuth, CDN de assets e variáveis de ambiente.

**URLs de produção:**
- Site público: `https://recanto-delivery.manus.space`
- URL alternativa: `https://recantodeliv-z28cutns.manus.space`
- Painel admin: `https://recanto-delivery.manus.space/admin`
- Servidor de desenvolvimento local: `http://localhost:3000`

---

## 2. Acesso ao Repositório GitHub

O código-fonte é exportado para o GitHub via integração nativa da plataforma Manus. Para acessar:

1. No painel de gerenciamento do Manus, acesse **Settings → GitHub**
2. O repositório exportado contém todos os commits com histórico completo
3. O repositório interno do Manus usa S3 como remote: `s3://vida-prod-gitrepo/webdev-git/310519663315286510/Z28cUTNS5S5j4gtNT63Tte`

**Convenção de commits:** use prefixos semânticos — `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`. Exemplo: `feat: adiciona página de avaliação pós-entrega`.

---

## 3. Acesso ao Servidor e Hospedagem

O projeto roda na infraestrutura gerenciada da **plataforma Manus**. Não há acesso SSH direto ao servidor de produção — toda a gestão é feita pelo painel web.

| Recurso | Como acessar |
|---|---|
| Painel de gerenciamento | Interface web do Manus (ícone de engrenagem no chat) |
| Logs do servidor | Painel → Dashboard → Logs |
| Variáveis de ambiente | Painel → Settings → Secrets |
| Banco de dados (UI) | Painel → Database (CRUD visual) |
| Domínios | Painel → Settings → Domains |
| Deploy/Publicar | Painel → botão "Publish" (requer checkpoint salvo) |
| Rollback | Painel → checkpoint anterior → botão "Rollback" |

**Importante:** nunca edite variáveis de ambiente diretamente no código. Todas as secrets são gerenciadas pelo painel Manus em **Settings → Secrets**.

---

## 4. Acesso ao Banco de Dados

O banco é **MySQL/TiDB** gerenciado pela plataforma Manus. A string de conexão é injetada automaticamente via `DATABASE_URL`.

**Acesso via UI:** no painel Manus, clique em **Database** para ver e editar registros diretamente via interface CRUD.

**Acesso via SQL:** use a aba de query no painel Database, ou execute via código com o Drizzle ORM.

**Acesso via código (Drizzle):**
```typescript
import { db } from "./server/_core/index"; // instância já configurada
import { orders, products } from "./drizzle/schema";
import { eq } from "drizzle-orm";

// Exemplo de query
const allOrders = await db.select().from(orders).where(eq(orders.status, "pendente"));
```

**Para aplicar mudanças no schema:**
```bash
pnpm db:push   # gera migration SQL e aplica no banco
```

As migrations ficam em `drizzle/*.sql` (atualmente 11 arquivos, de `0000_` a `0010_`).

---

## 5. Variáveis de Ambiente

Todas as variáveis são injetadas automaticamente pela plataforma Manus. **Nunca crie arquivos `.env` manualmente.**

| Variável | Lado | Descrição |
|---|---|---|
| `DATABASE_URL` | Server | String de conexão MySQL/TiDB |
| `JWT_SECRET` | Server | Segredo para assinatura de cookies de sessão |
| `VITE_APP_ID` | Ambos | ID da aplicação Manus OAuth |
| `OAUTH_SERVER_URL` | Server | URL base do servidor OAuth Manus |
| `VITE_OAUTH_PORTAL_URL` | Client | URL do portal de login Manus |
| `STRIPE_SECRET_KEY` | Server | Chave secreta do Stripe |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Client | Chave pública do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Server | Segredo para verificação de webhooks Stripe |
| `BUILT_IN_FORGE_API_KEY` | Server | Token para APIs internas Manus |
| `BUILT_IN_FORGE_API_URL` | Server | URL das APIs internas Manus |
| `VITE_FRONTEND_FORGE_API_KEY` | Client | Token para APIs Manus no frontend |
| `VITE_FRONTEND_FORGE_API_URL` | Client | URL das APIs Manus no frontend |
| `OWNER_OPEN_ID` | Server | OpenID do dono (notificações) |
| `OWNER_NAME` | Server | Nome do dono do projeto |

Para acessar no servidor, use o objeto `ENV` de `server/_core/env.ts`:
```typescript
import { ENV } from "./_core/env";
console.log(ENV.databaseUrl); // DATABASE_URL
```

---

## 6. Stack Tecnológica Completa

| Camada | Tecnologia | Versão | Arquivo principal |
|---|---|---|---|
| Frontend | React | 19 | `client/src/main.tsx` |
| Roteamento | Wouter | 3.x | `client/src/App.tsx` |
| Estilização | Tailwind CSS | 4 | `client/src/index.css` |
| Componentes | shadcn/ui + Radix UI | — | `client/src/components/ui/` |
| Gráficos | Recharts | 2.x | `AdminRelatorios.tsx` |
| Animações | Framer Motion | 12.x | vários componentes |
| API | tRPC | 11 | `server/routers.ts` |
| Backend | Express | 4 | `server/_core/index.ts` |
| ORM | Drizzle ORM | 0.44 | `drizzle/schema.ts`, `server/db.ts` |
| Banco | MySQL / TiDB | — | via `DATABASE_URL` |
| Auth | Manus OAuth (JWT) | — | `server/_core/oauth.ts` |
| Pagamentos | Stripe | 20.x | `server/routers.ts` (stripe router) |
| Storage | AWS S3 | — | `server/storage.ts` |
| Linguagem | TypeScript | 5.9 | `tsconfig.json` |
| Build | Vite | 7 | `vite.config.ts` |
| Testes | Vitest | 2.x | `server/*.test.ts` |
| Pacotes | pnpm | 10 | `package.json` |

---

## 7. Estrutura de Arquivos

```
recanto-delivery/
├── client/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── manifest.json          ← PWA manifest
│   │   └── sw.js                  ← Service Worker
│   └── src/
│       ├── components/
│       │   ├── ui/                ← shadcn/ui (NÃO editar diretamente)
│       │   ├── DashboardLayout.tsx  ← Sidebar admin (grupos: Operações, Gestão, Análise, Sistema)
│       │   ├── CartDrawer.tsx       ← Carrinho lateral
│       │   ├── SplashScreen.tsx     ← Tela de carregamento inicial
│       │   ├── BackButton.tsx       ← Botão voltar reutilizável
│       │   ├── PageTransition.tsx   ← Wrapper de animação de página
│       │   ├── ProductCardSkeleton.tsx ← Skeleton loader dos cards
│       │   ├── ErrorBoundary.tsx
│       │   └── Map.tsx              ← Google Maps (proxy Manus)
│       ├── contexts/
│       │   ├── CartContext.tsx     ← Estado global do carrinho (sem persistência)
│       │   └── ThemeContext.tsx    ← Tema claro/escuro
│       ├── hooks/
│       │   └── useMobile.tsx
│       ├── pages/
│       │   ├── Home.tsx            ← Cardápio + header com navegação
│       │   ├── ProductDetail.tsx   ← Página por produto com adicionais
│       │   ├── Checkout.tsx        ← Formulário + Stripe Elements
│       │   ├── OrderTracking.tsx   ← Rastreamento com polling 15s
│       │   ├── MeusPedidos.tsx     ← Histórico do cliente logado
│       │   ├── Register.tsx        ← Cadastro de cliente (sem OAuth)
│       │   ├── AppDownload.tsx     ← Landing page PWA
│       │   ├── AdminDashboard.tsx  ← Painel de pedidos (admin)
│       │   ├── AdminCardapio.tsx   ← CRUD de produtos e adicionais
│       │   ├── AdminRelatorios.tsx ← Gráficos e métricas
│       │   ├── AdminLogin.tsx      ← Login admin via OAuth Manus
│       │   ├── NotFound.tsx
│       │   └── admin/
│       │       └── AdminConfiguracoes.tsx ← Configurações da loja
│       ├── lib/
│       │   ├── trpc.ts            ← Cliente tRPC (NÃO editar)
│       │   └── utils.ts           ← cn() helper
│       ├── const.ts               ← getLoginUrl(), constantes
│       ├── App.tsx                ← Roteamento + providers
│       ├── main.tsx               ← Entry point (QueryClient, tRPC)
│       └── index.css              ← Tokens de design + Tailwind + fonte Nunito
├── drizzle/
│   ├── schema.ts                  ← FONTE DA VERDADE do banco
│   ├── relations.ts               ← Relações Drizzle
│   └── 0000_*.sql … 0010_*.sql   ← Migrações (não editar manualmente)
├── server/
│   ├── _core/                     ← Infraestrutura (NÃO editar salvo extensões)
│   │   ├── index.ts               ← Entry point do servidor Express
│   │   ├── context.ts             ← ctx.user injetado em cada request
│   │   ├── trpc.ts                ← publicProcedure, protectedProcedure, router
│   │   ├── oauth.ts               ← Fluxo OAuth Manus
│   │   ├── env.ts                 ← Objeto ENV com todas as variáveis
│   │   ├── notification.ts        ← notifyOwner({ title, content })
│   │   ├── llm.ts                 ← invokeLLM({ messages })
│   │   ├── imageGeneration.ts     ← generateImage({ prompt })
│   │   └── map.ts                 ← makeRequest para Google Maps
│   ├── db.ts                      ← Todos os query helpers (Drizzle)
│   ├── routers.ts                 ← Todos os procedures tRPC
│   ├── storage.ts                 ← storagePut(), storageGet() para S3
│   ├── auth.logout.test.ts        ← Teste de referência
│   └── orders.test.ts             ← Testes de pedidos
├── shared/
│   ├── const.ts                   ← COOKIE_NAME e outras constantes
│   └── types.ts                   ← Re-exporta tipos do schema
├── CLAUDE.md                      ← Este arquivo
├── README.md                      ← Documentação geral
├── CHANGELOG.md                   ← Histórico de versões
├── todo.md                        ← Histórico de features implementadas
├── package.json
├── drizzle.config.ts
├── vite.config.ts
└── tsconfig.json
```

---

## 8. Schema do Banco de Dados

O schema completo está em `drizzle/schema.ts`. Abaixo, a descrição de cada tabela e seus campos mais importantes.

### `users` — Usuários autenticados via Manus OAuth

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int PK | Surrogate key |
| `openId` | varchar(64) UNIQUE | ID do Manus OAuth |
| `name` | text | Nome do usuário |
| `email` | varchar(320) | E-mail |
| `role` | enum | `"user"` ou `"admin"` |
| `createdAt` | timestamp | Data de criação |

Para promover um usuário a admin, execute via painel Database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'seu@email.com';
```

### `products` — Cardápio

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int PK | — |
| `name` | varchar(255) | Nome do produto |
| `description` | text | Descrição |
| `price` | decimal(10,2) | Preço base |
| `imageUrl` | text | URL CDN da imagem |
| `category` | varchar(100) | Ex: `"açaí"`, `"combo"` |
| `available` | boolean | Visível no cardápio? |

### `orders` — Pedidos

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int PK | Número do pedido |
| `customerName` | varchar(255) | Nome do cliente |
| `customerPhone` | varchar(20) | Telefone |
| `address` | text | Endereço completo |
| `neighborhood` | varchar(255) | Bairro |
| `complement` | varchar(255) | Complemento |
| `paymentMethod` | enum | `dinheiro`, `pix`, `cartao_debito`, `cartao_credito`, `cartao_online` |
| `status` | enum | `pendente`, `confirmado`, `em_preparo`, `saiu_entrega`, `entregue`, `cancelado` |
| `deliveryFee` | decimal(10,2) | Taxa de entrega (padrão: 4.90) |
| `totalAmount` | decimal(10,2) | Total do pedido |
| `changeFor` | decimal(10,2) | Troco para (quando dinheiro) |
| `notes` | text | Observações gerais |
| `stripePaymentIntentId` | varchar(255) | ID do PaymentIntent Stripe |
| `deliveryPersonId` | int FK | Entregador atribuído |
| `userId` | int FK | Usuário logado (opcional) |

### `orderItems` — Itens do pedido

| Campo | Tipo | Descrição |
|---|---|---|
| `orderId` | int FK | Referência ao pedido |
| `productId` | int FK | Referência ao produto |
| `productName` | varchar(255) | Nome no momento do pedido |
| `quantity` | int | Quantidade |
| `unitPrice` | decimal(10,2) | Preço unitário base |
| `subtotal` | decimal(10,2) | unitPrice × quantity + adicionais |
| `addonsJson` | text | JSON: `[{addonId, addonName, price}]` |
| `notes` | text | Observações do item |

### `addonCategories` — Categorias de adicionais

| Campo | Tipo | Descrição |
|---|---|---|
| `productId` | int FK | Produto ao qual pertence |
| `name` | varchar(100) | Ex: "Complementos", "Coberturas" |
| `required` | boolean | Seleção obrigatória? |
| `minSelect` | int | Mínimo de itens a selecionar |
| `maxSelect` | int | Máximo (1 = radio, >1 = checkbox) |
| `sortOrder` | int | Ordem de exibição |

### `addons` — Adicionais individuais

| Campo | Tipo | Descrição |
|---|---|---|
| `categoryId` | int FK | Categoria à qual pertence |
| `name` | varchar(150) | Ex: "Granola", "Leite Ninho" |
| `price` | decimal(10,2) | Preço adicional (0.00 = grátis) |
| `available` | boolean | Disponível para seleção? |
| `sortOrder` | int | Ordem de exibição |

### `customers` — Clientes cadastrados (sem OAuth)

| Campo | Tipo | Descrição |
|---|---|---|
| `phone` | varchar(20) UNIQUE | Identificador único |
| `name` | varchar(255) | Nome |
| `email` | varchar(320) | E-mail (opcional) |
| `address` | text | Endereço |
| `totalOrders` | int | Contador de pedidos |

### `deliveryPersons` — Entregadores

| Campo | Tipo | Descrição |
|---|---|---|
| `name` | varchar(255) | Nome |
| `phone` | varchar(20) | Telefone |
| `pin` | varchar(6) | PIN de login (4-6 dígitos) |
| `cpf` | varchar(14) | CPF formatado |
| `shift` | enum | `manha`, `tarde`, `noite`, `integral` |
| `hiredAt` | varchar(10) | Data de admissão `YYYY-MM-DD` |
| `active` | boolean | Ativo? |

### `storeSettings` — Configurações da loja

| Campo | Tipo | Descrição |
|---|---|---|
| `key` | varchar(100) UNIQUE | Chave da configuração |
| `value` | text | Valor (texto ou JSON) |
| `label` | varchar(255) | Rótulo amigável |

**Chaves usadas atualmente:** `storeName`, `storePhone`, `storeInstagram`, `address`, `addressNumber`, `neighborhood`, `city`, `state`, `zipCode`, `googleMapsUrl`, `mondayToFriday`, `saturday`, `sunday`, `holidays`, `estimatedDeliveryTime`, `deliveryFee`, `minimumOrder`, `freeDeliveryAbove`, `deliveryRadius`, `closedMessage`, `whatsappConfirmation`.

---

## 9. API tRPC — Referência Completa

Todos os procedures estão em `server/routers.ts`. O cliente tRPC é instanciado em `client/src/lib/trpc.ts`.

### Tipos de procedure

```typescript
publicProcedure    // Qualquer usuário (logado ou não)
protectedProcedure // Requer usuário logado (ctx.user não é null)
adminProcedure     // Requer ctx.user.role === "admin"
```

### Referência de todos os procedures

| Procedure | Tipo | Método | Descrição |
|---|---|---|---|
| `auth.me` | public | query | Retorna usuário atual ou null |
| `auth.logout` | public | mutation | Limpa cookie de sessão |
| `products.list` | public | query | Lista produtos disponíveis (seed automático) |
| `products.listAdmin` | admin | query | Lista todos os produtos (incluindo inativos) |
| `products.create` | admin | mutation | Cria produto |
| `products.update` | admin | mutation | Atualiza produto |
| `products.toggleAvailability` | admin | mutation | Ativa/desativa produto |
| `orders.create` | public | mutation | Cria pedido + notifica dono |
| `orders.list` | admin | query | Lista todos os pedidos |
| `orders.getById` | admin | query | Busca pedido por ID (dados completos) |
| `orders.track` | public | query | Rastreamento público (dados seguros) |
| `orders.updateStatus` | admin | mutation | Atualiza status do pedido |
| `customers.register` | public | mutation | Cadastra cliente por telefone |
| `customers.getByPhone` | public | query | Busca cliente por telefone |
| `customers.list` | admin | query | Lista todos os clientes |
| `delivery.login` | public | mutation | Login do entregador por PIN |
| `delivery.getById` | public | query | Dados do entregador por ID |
| `delivery.stats` | admin | query | Métricas de desempenho do entregador |
| `delivery.orderHistory` | admin | query | Histórico de pedidos do entregador |
| `delivery.myOrders` | public | query | Pedidos atribuídos ao entregador |
| `delivery.updateOrderStatus` | public | mutation | Entregador atualiza status (saiu/entregue) |
| `delivery.list` | admin | query | Lista todos os entregadores |
| `delivery.create` | admin | mutation | Cadastra entregador |
| `delivery.update` | admin | mutation | Atualiza dados do entregador |
| `delivery.assignOrder` | admin | mutation | Atribui pedido a entregador |
| `addons.getProduct` | public | query | Produto + categorias + adicionais |
| `addons.listCategories` | admin | query | Categorias de adicionais por produto |
| `addons.createCategory` | admin | mutation | Cria categoria de adicionais |
| `addons.updateCategory` | admin | mutation | Atualiza categoria |
| `addons.deleteCategory` | admin | mutation | Deleta categoria e seus adicionais |
| `addons.createAddon` | admin | mutation | Cria adicional |
| `addons.updateAddon` | admin | mutation | Atualiza adicional |
| `addons.deleteAddon` | admin | mutation | Deleta adicional |
| `storeConfig.get` | admin | query | Lê todas as configurações da loja |
| `storeConfig.save` | admin | mutation | Salva array de configurações (upsert) |
| `myOrders.list` | protected | query | Histórico de pedidos do usuário logado |
| `stripe.createPaymentIntent` | public | mutation | Cria PaymentIntent no Stripe |
| `reports.summary` | admin | query | Métricas gerais (total, faturamento, ticket) |
| `reports.byDay` | admin | query | Pedidos por dia (7-90 dias) |
| `reports.byPayment` | admin | query | Distribuição por forma de pagamento |
| `system.notifyOwner` | protected | mutation | Envia notificação ao dono |

### Como usar no frontend

```typescript
// Query
const { data, isLoading } = trpc.products.list.useQuery();

// Mutation com invalidação
const utils = trpc.useUtils();
const createOrder = trpc.orders.create.useMutation({
  onSuccess: () => utils.orders.list.invalidate(),
});

// Mutation com optimistic update
const toggleAvail = trpc.products.toggleAvailability.useMutation({
  onMutate: async ({ id, available }) => {
    await utils.products.listAdmin.cancel();
    const prev = utils.products.listAdmin.getData();
    utils.products.listAdmin.setData(undefined, (old) =>
      old?.map((p) => p.id === id ? { ...p, available } : p)
    );
    return { prev };
  },
  onError: (_, __, ctx) => utils.products.listAdmin.setData(undefined, ctx?.prev),
  onSettled: () => utils.products.listAdmin.invalidate(),
});
```

---

## 10. Autenticação e Controle de Acesso

O sistema usa **Manus OAuth** com cookies JWT. O fluxo é:

1. Frontend chama `getLoginUrl(returnPath?)` de `client/src/const.ts`
2. Usuário é redirecionado para o portal Manus e faz login
3. Callback em `/api/oauth/callback` valida o token e cria cookie de sessão
4. Cada request a `/api/trpc` lê o cookie e popula `ctx.user`

```typescript
// Verificar usuário no frontend
import { trpc } from "@/lib/trpc";
const { data: user } = trpc.auth.me.useQuery();
// user é null se não logado, ou { id, name, email, role, ... } se logado

// Verificar role no backend
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});
```

**Para acessar o painel admin:** acesse `/login` e faça login com a conta Manus do proprietário. O sistema verifica `role === "admin"` no banco. Para promover um usuário a admin via SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'proprietario@email.com';
```

---

## 11. Carrinho de Compras

O carrinho é gerenciado pelo `CartContext` em memória (sem persistência em localStorage). Ao recarregar a página, o carrinho é limpo.

```typescript
import { useCart } from "@/contexts/CartContext";

const { items, addItem, removeItem, updateQuantity, clearCart,
        totalItems, totalAmount, grandTotal, deliveryFee,
        isOpen, setIsOpen } = useCart();

// Adicionar item (mesmo produto com adicionais diferentes = itens separados)
addItem({
  productId: 1,
  productName: "Açaí Tradicional 500ml",
  unitPrice: 24.90,
  selectedAddons: [{ addonId: 3, addonName: "Granola", price: 0 }],
  addonsTotal: 0,
  notes: "Sem banana",
});
```

A taxa de entrega (`DELIVERY_FEE = 4.90`) é aplicada automaticamente quando há itens no carrinho.

---

## 12. Design System

### Paleta de Cores

O tema é definido em `client/src/index.css` com variáveis CSS. O `ThemeProvider` usa `defaultTheme="light"`.

| Token CSS | Valor OKLCH | Uso |
|---|---|---|
| `--color-brand-purple` | `oklch(0.38 0.22 305)` | Cor primária — headers, botões |
| `--color-brand-purple-dark` | `oklch(0.28 0.20 305)` | Hover e estados ativos |
| `--color-brand-gold` | `oklch(0.77 0.19 90)` | Destaque — preços, CTAs |
| `--color-brand-light` | `oklch(0.97 0.02 305)` | Fundo lilás suave |

**Classes utilitárias personalizadas:** `bg-brand-purple`, `text-brand-purple`, `bg-brand-gold`, `text-brand-gold`, `bg-brand-light`.

### Tipografia

Fonte: **Nunito** (Google Fonts), carregada no `client/index.html`. Pesos: 400, 600, 700, 800, 900. Títulos usam `font-black` (900).

### Animações

Definidas em `client/src/index.css`:

```css
animate-page-enter    /* fade + slide ao entrar na página */
animate-slide-up      /* entrada em cascata dos cards */
animate-cart-bounce   /* feedback ao adicionar ao carrinho */
animate-shimmer       /* skeleton loader com brilho */
animate-pop-in        /* entrada com escala */
```

### Assets e Imagens

**Todos os assets estão no CDN do Manus.** Nunca armazene imagens em `client/public/` ou `client/src/assets/` — isso causa timeout no deploy.

Para adicionar novos assets:
```bash
manus-upload-file --webdev /caminho/local/imagem.png
# Retorna URL CDN para usar no código
```

URLs CDN dos assets atuais (logo, ícones dos produtos, ícones do sidebar) estão hardcoded nos componentes que os usam.

---

## 13. Pagamentos Stripe

O projeto usa **Stripe Elements** com `PaymentIntent` (não Checkout Session).

**Fluxo:**
1. Cliente seleciona "Cartão Online" no checkout
2. Frontend chama `trpc.stripe.createPaymentIntent.mutate({ amount, orderId, customerName })`
3. Backend cria `PaymentIntent` e retorna `clientSecret`
4. Frontend renderiza `<PaymentElement>` do `@stripe/react-stripe-js`
5. Após confirmação, o pedido já está criado com `stripePaymentIntentId`

**Chaves de teste:** use cartão `4242 4242 4242 4242`, qualquer data futura, qualquer CVV.

**Webhook:** o endpoint `/api/stripe/webhook` processa `payment_intent.succeeded`. Eventos de teste (ID começando com `evt_test_`) retornam `{ verified: true }` imediatamente.

---

## 14. Notificações ao Dono

Use `notifyOwner` do servidor para enviar alertas ao proprietário via plataforma Manus:

```typescript
import { notifyOwner } from "./_core/notification";

await notifyOwner({
  title: "🛵 Novo pedido #42 - João Silva",
  content: "**Total:** R$ 49,80\n**Pagamento:** PIX\n**Endereço:** Rua das Flores, 100",
});
```

Isso é chamado automaticamente em `orders.create` para cada novo pedido.

---

## 15. Upload de Arquivos (S3)

```typescript
import { storagePut } from "./server/storage";

const fileKey = `products/${productId}-image-${Date.now()}.jpg`;
const { url } = await storagePut(fileKey, fileBuffer, "image/jpeg");
// url é pública e permanente — salve no banco
```

O bucket S3 é público. Sempre adicione sufixo aleatório ou timestamp na chave para evitar colisões.

---

## 16. Rotas da Aplicação

Definidas em `client/src/App.tsx` via Wouter:

| Rota | Componente | Acesso |
|---|---|---|
| `/` | `Home.tsx` | Público |
| `/produto/:id` | `ProductDetail.tsx` | Público |
| `/checkout` | `Checkout.tsx` | Público |
| `/pedido/:id` | `OrderTracking.tsx` | Público |
| `/cadastro` | `Register.tsx` | Público |
| `/app` ou `/instalar` | `AppDownload.tsx` | Público |
| `/meus-pedidos` | `MeusPedidos.tsx` | Logado |
| `/login` | `AdminLogin.tsx` | Público |
| `/admin` | `AdminDashboard.tsx` | Admin |
| `/admin/cardapio` | `AdminCardapio.tsx` | Admin |
| `/admin/relatorios` | `AdminRelatorios.tsx` | Admin |
| `/admin/configuracoes` | `AdminConfiguracoes.tsx` | Admin |

---

## 17. Convenções de Desenvolvimento

### Regra de ouro: tRPC para tudo

Nunca crie endpoints REST manuais. Toda comunicação cliente-servidor passa por `server/routers.ts` via tRPC. No frontend, use sempre `trpc.*.useQuery` ou `trpc.*.useMutation`.

### Fluxo para adicionar uma feature

1. **Schema:** adicione ou altere tabelas em `drizzle/schema.ts`
2. **Migração:** execute `pnpm db:push`
3. **Query helpers:** adicione funções em `server/db.ts` (retornam rows Drizzle)
4. **Procedure:** adicione o procedure em `server/routers.ts`
5. **Frontend:** consuma com `trpc.*.useQuery/useMutation` na página
6. **Rota:** registre em `client/src/App.tsx` se for página nova
7. **Testes:** escreva ou atualize `server/*.test.ts`

### Padrão de optimistic update

```typescript
const mutation = trpc.feature.update.useMutation({
  onMutate: async (input) => {
    await utils.feature.list.cancel();
    const prev = utils.feature.list.getData();
    utils.feature.list.setData(undefined, (old) =>
      old?.map((item) => item.id === input.id ? { ...item, ...input } : item)
    );
    return { prev };
  },
  onError: (_, __, ctx) => utils.feature.list.setData(undefined, ctx?.prev),
  onSettled: () => utils.feature.list.invalidate(),
});
```

### Sidebar admin (DashboardLayout)

Para adicionar item ao sidebar, edite `client/src/components/DashboardLayout.tsx`. A estrutura de navegação usa grupos com `label`, `icon` e `href`. Itens com `placeholder: true` mostram toast "Em breve" ao clicar.

### Imagens de produtos

Use sempre URLs CDN. Para atualizar a imagem de um produto:
```bash
manus-upload-file --webdev /caminho/imagem.jpg
# Copie a URL retornada e salve via trpc.products.update.mutate({ id, imageUrl: "https://..." })
```

---

## 18. Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor em localhost:3000

# Banco de dados
pnpm db:push          # Aplica mudanças do schema no banco

# Qualidade
pnpm test             # Roda testes Vitest
pnpm check            # Verifica tipos TypeScript
pnpm format           # Formata com Prettier

# Build e produção
pnpm build            # Gera build de produção
pnpm start            # Inicia servidor de produção

# Assets
manus-upload-file --webdev arquivo.png   # Upload para CDN
```

---

## 19. Problemas Conhecidos e Limitações

**Carrinho sem persistência:** o estado do carrinho é perdido ao recarregar a página. Para implementar persistência, use `localStorage` no `CartContext`.

**Polling em vez de WebSocket:** o `OrderTracking` e o `AdminDashboard` usam polling a cada 15 segundos. Para tempo real verdadeiro, seria necessário implementar WebSockets ou Server-Sent Events.

**Configurações da loja não usadas dinamicamente:** a tabela `storeSettings` existe e é editável pelo admin, mas o header ainda mostra "30–45 min" hardcoded e o checkout usa taxa de frete fixa de R$ 4,90. A próxima melhoria prioritária é ler esses valores dinamicamente.

**Autenticação do entregador sem OAuth:** o login do entregador usa PIN simples salvo em texto plano no banco. Para produção, considere hash do PIN com bcrypt.

---

## 20. Próximas Features Sugeridas

As features abaixo estão identificadas como próximos passos naturais do projeto:

**Alta prioridade:**
- Ler `storeSettings` dinamicamente no header (tempo de entrega) e no checkout (taxa de frete)
- Exibir banner "Loja fechada" quando fora do horário configurado em `storeSettings`
- Notificações de status por WhatsApp Business API

**Média prioridade:**
- Persistência do carrinho em `localStorage`
- Avaliação pós-entrega (1–5 estrelas) após status "entregue"
- Cupons de desconto integrados ao Stripe

**Baixa prioridade:**
- Substituir polling por WebSocket no rastreamento
- Hash do PIN dos entregadores com bcrypt
- Relatórios exportáveis em PDF/Excel

---

*Documento gerado em 06/03/2026. Mantenha este arquivo atualizado a cada mudança significativa de arquitetura.*
