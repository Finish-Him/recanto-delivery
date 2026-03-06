# 🍇 Recanto Delivery

> Plataforma completa de delivery para o **Recanto do Açaí** — cardápio digital, pedidos online, painel administrativo e rastreamento em tempo real.

<p align="center">
  <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663315286510/Z28cUTNS5S5j4gtNT63Tte/logo-recanto-app-BiGZ2DoJqLYmsEJWh6h9pU.webp" alt="Recanto do Açaí" width="120" />
</p>

<p align="center">
  <a href="#visão-geral">Visão Geral</a> •
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#stack-tecnológica">Stack</a> •
  <a href="#banco-de-dados">Banco de Dados</a> •
  <a href="#estrutura-do-projeto">Estrutura</a> •
  <a href="#variáveis-de-ambiente">Variáveis de Ambiente</a> •
  <a href="#como-rodar">Como Rodar</a> •
  <a href="#rotas-da-aplicação">Rotas</a> •
  <a href="#api-trpc">API tRPC</a> •
  <a href="#design-system">Design System</a> •
  <a href="#changelog">Changelog</a>
</p>

---

## Visão Geral

O **Recanto Delivery** é uma aplicação web full-stack desenvolvida para o Recanto do Açaí, uma sorveteria especializada em açaí localizada no Rio de Janeiro. A plataforma permite que clientes naveguem pelo cardápio, montem pedidos personalizados com adicionais, finalizem o pagamento (incluindo cartão de crédito via Stripe) e acompanhem o status da entrega em tempo real.

Do lado do estabelecimento, o painel administrativo oferece gestão completa de pedidos com atualização de status, gerenciamento do cardápio (CRUD de produtos e adicionais), relatórios de vendas com gráficos e configurações da loja (endereço, horários, taxas).

A aplicação é uma **PWA (Progressive Web App)**, podendo ser instalada no celular como um aplicativo nativo, com suporte offline básico via Service Worker.

---

## Funcionalidades

### Para o Cliente

A experiência do cliente começa em uma landing page com identidade visual da marca — paleta roxa e dourada, tipografia Nunito Bold e animações suaves. O cardápio é exibido em cards com foto, descrição, preço e botão de adição direta ao carrinho.

Ao clicar em um produto, o cliente acessa uma **página dedicada por produto** (rota `/produto/:id`) com seleção de adicionais organizados por categoria (complementos, coberturas, frutas), campo de observações livres e cálculo automático do subtotal. O sistema suporta seleção única (radio) ou múltipla (checkbox) por categoria, com validação de mínimo e máximo.

O **carrinho lateral** (drawer) exibe todos os itens com adicionais e observações, permitindo ajuste de quantidades e remoção. O checkout coleta nome, endereço, bairro, complemento, forma de pagamento (dinheiro com troco, PIX, débito, crédito ou cartão online via Stripe) e exibe o resumo com taxa de entrega.

Após o pedido, o cliente é redirecionado para a **página de rastreamento** (`/pedido/:id`) com uma timeline visual de status que atualiza automaticamente a cada 15 segundos.

Clientes com conta Manus podem acessar **Meus Pedidos** (`/meus-pedidos`) para ver o histórico completo com opção de repetir qualquer pedido com um clique.

| Funcionalidade | Rota | Autenticação |
|---|---|---|
| Cardápio | `/` | Pública |
| Detalhe do produto | `/produto/:id` | Pública |
| Checkout | `/checkout` | Pública |
| Rastreamento do pedido | `/pedido/:id` | Pública |
| Meus Pedidos | `/meus-pedidos` | Requer login |
| Cadastro de cliente | `/cadastro` | Pública |
| Instalar App (PWA) | `/app` | Pública |

### Para o Administrador

O painel admin (`/admin`) é protegido por autenticação OAuth Manus com verificação de `role = "admin"`. A interface usa o `DashboardLayout` com sidebar colapsável organizado em quatro grupos: **Operações**, **Gestão**, **Análise** e **Sistema**.

**Gestão de Pedidos** (`/admin`): lista em tempo real com polling a cada 15 segundos, filtros por status e entregador, busca por nome/telefone/endereço/#ID, cards expansíveis com todos os detalhes (itens, adicionais, observações, forma de pagamento, troco), botões de avanço rápido de status e atribuição de entregador.

**Cardápio** (`/admin/cardapio`): CRUD completo de produtos com upload de imagem, toggle de disponibilidade e painel lateral para gerenciar categorias de adicionais e adicionais individuais por produto.

**Relatórios** (`/admin/relatorios`): dashboard com cards de métricas (pedidos hoje, faturamento total, ticket médio, pedidos ativos), gráfico de pedidos por dia (últimos 7 e 30 dias via Recharts) e distribuição por forma de pagamento.

**Configurações** (`/admin/configuracoes`): formulário com 5 grupos expansíveis para editar informações da loja, endereço completo (com link Google Maps), horários de funcionamento por dia da semana, taxas de entrega e mensagens automáticas (WhatsApp, loja fechada).

| Funcionalidade | Rota |
|---|---|
| Painel de Pedidos | `/admin` |
| Login Admin | `/admin/login` |
| Cardápio (CRUD) | `/admin/cardapio` |
| Relatórios | `/admin/relatorios` |
| Configurações da Loja | `/admin/configuracoes` |

---

## Stack Tecnológica

O projeto usa uma stack moderna e fortemente tipada, com contratos de API compartilhados entre frontend e backend via tRPC.

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React | 19 |
| Roteamento | Wouter | 3.x |
| Estilização | Tailwind CSS | 4 |
| Componentes UI | shadcn/ui + Radix UI | — |
| Gráficos | Recharts | 2.x |
| Animações | Framer Motion | 12.x |
| API | tRPC | 11 |
| Backend | Express | 4 |
| ORM | Drizzle ORM | 0.44 |
| Banco de Dados | MySQL / TiDB | — |
| Autenticação | Manus OAuth (JWT) | — |
| Pagamentos | Stripe | 20.x |
| Storage | AWS S3 | — |
| Linguagem | TypeScript | 5.9 |
| Build | Vite | 7 |
| Testes | Vitest | 2.x |
| Gerenciador de pacotes | pnpm | 10 |

---

## Banco de Dados

O schema é definido em `drizzle/schema.ts` e gerenciado pelo Drizzle ORM com migrações automáticas via `pnpm db:push`.

### Tabelas

**`users`** — Usuários autenticados via Manus OAuth. Inclui campo `role` (`user` | `admin`) para controle de acesso.

**`products`** — Produtos do cardápio com nome, descrição, preço, URL da imagem, categoria e flag de disponibilidade.

**`addonCategories`** — Categorias de adicionais vinculadas a um produto (ex: "Complementos", "Coberturas"). Suporta seleção obrigatória, mínimo e máximo de itens.

**`addons`** — Adicionais individuais dentro de uma categoria (ex: "Granola", "Leite Ninho") com preço e disponibilidade.

**`orders`** — Pedidos com dados do cliente (nome, telefone, endereço), forma de pagamento, status, taxa de entrega, total, troco e referência ao usuário logado (opcional).

**`orderItems`** — Itens de cada pedido com nome do produto, quantidade, preço unitário, subtotal, adicionais selecionados (JSON) e observações.

**`customers`** — Clientes cadastrados diretamente (sem OAuth), com telefone único como identificador.

**`deliveryPersons`** — Entregadores com PIN de acesso, CPF, turno, data de admissão e histórico.

**`storeSettings`** — Configurações da loja em formato chave-valor (endereço, horários, taxas, mensagens).

```
users              products           orders
├── id             ├── id             ├── id
├── openId         ├── name           ├── customerName
├── name           ├── description    ├── customerPhone
├── email          ├── price          ├── address
├── role           ├── imageUrl       ├── paymentMethod
└── createdAt      ├── category       ├── status
                   └── available      ├── deliveryFee
                                      ├── totalAmount
addonCategories    addons             ├── userId (FK)
├── id             ├── id             └── deliveryPersonId (FK)
├── productId (FK) ├── categoryId (FK)
├── name           ├── name           orderItems
├── required       ├── price          ├── id
├── minSelect      └── available      ├── orderId (FK)
└── maxSelect                         ├── productId (FK)
                                      ├── addonsJson
storeSettings                         └── notes
├── id
├── key
└── value
```

---

## Estrutura do Projeto

```
recanto-delivery/
├── client/
│   ├── public/              # favicon.ico, manifest.json, sw.js (PWA)
│   └── src/
│       ├── components/
│       │   ├── ui/          # shadcn/ui (Button, Card, Dialog, etc.)
│       │   ├── DashboardLayout.tsx   # Sidebar admin com navegação
│       │   ├── CartDrawer.tsx        # Carrinho lateral
│       │   ├── SplashScreen.tsx      # Tela de carregamento inicial
│       │   └── Map.tsx               # Integração Google Maps
│       ├── contexts/
│       │   ├── CartContext.tsx       # Estado global do carrinho
│       │   └── ThemeContext.tsx
│       ├── hooks/
│       │   └── useMobile.tsx
│       ├── pages/
│       │   ├── Home.tsx              # Cardápio + header com navegação
│       │   ├── ProductDetail.tsx     # Página por produto com adicionais
│       │   ├── Checkout.tsx          # Formulário de pedido + Stripe
│       │   ├── OrderTracking.tsx     # Rastreamento em tempo real
│       │   ├── MeusPedidos.tsx       # Histórico do cliente logado
│       │   ├── Register.tsx          # Cadastro de cliente
│       │   ├── AppDownload.tsx       # Landing page PWA
│       │   ├── AdminDashboard.tsx    # Painel de pedidos
│       │   ├── AdminCardapio.tsx     # CRUD de produtos
│       │   ├── AdminRelatorios.tsx   # Relatórios e gráficos
│       │   ├── AdminLogin.tsx        # Login admin
│       │   └── admin/
│       │       └── AdminConfiguracoes.tsx  # Configurações da loja
│       ├── lib/
│       │   └── trpc.ts              # Cliente tRPC
│       ├── App.tsx                  # Roteamento principal
│       ├── main.tsx                 # Providers (QueryClient, tRPC)
│       └── index.css                # Tokens de design + Tailwind
├── drizzle/
│   ├── schema.ts                    # Definição de todas as tabelas
│   ├── relations.ts                 # Relações entre tabelas
│   └── *.sql                        # Migrações geradas automaticamente
├── server/
│   ├── _core/                       # Infraestrutura (OAuth, tRPC, env)
│   ├── db.ts                        # Query helpers (Drizzle)
│   ├── routers.ts                   # Todos os procedures tRPC
│   ├── storage.ts                   # Helpers S3
│   └── *.test.ts                    # Testes Vitest
├── shared/
│   ├── const.ts                     # Constantes compartilhadas
│   └── types.ts                     # Tipos compartilhados
├── todo.md                          # Histórico de funcionalidades
├── package.json
├── drizzle.config.ts
├── vite.config.ts
└── tsconfig.json
```

---

## Variáveis de Ambiente

Todas as variáveis são injetadas automaticamente pela plataforma Manus. Não é necessário criar arquivos `.env` manualmente.

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão MySQL/TiDB |
| `JWT_SECRET` | Segredo para assinatura de cookies de sessão |
| `VITE_APP_ID` | ID da aplicação Manus OAuth |
| `OAUTH_SERVER_URL` | URL base do servidor OAuth Manus |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login Manus (frontend) |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe (server-side) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Chave pública do Stripe (frontend) |
| `STRIPE_WEBHOOK_SECRET` | Segredo para verificação de webhooks Stripe |
| `BUILT_IN_FORGE_API_KEY` | Token para APIs internas Manus (server) |
| `BUILT_IN_FORGE_API_URL` | URL das APIs internas Manus |
| `OWNER_OPEN_ID` | OpenID do dono do projeto (notificações) |

---

## Como Rodar

### Pré-requisitos

- Node.js 22+
- pnpm 10+
- Banco MySQL ou TiDB acessível via `DATABASE_URL`

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/recanto-delivery.git
cd recanto-delivery

# Instalar dependências
pnpm install

# Aplicar migrações do banco
pnpm db:push

# Iniciar em modo desenvolvimento
pnpm dev
```

O servidor sobe em `http://localhost:3000`. O Vite serve o frontend com HMR e o Express serve a API em `/api/trpc`.

### Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Inicia servidor de desenvolvimento com hot-reload |
| `pnpm build` | Gera build de produção (Vite + esbuild) |
| `pnpm start` | Inicia servidor de produção |
| `pnpm db:push` | Gera e aplica migrações do banco |
| `pnpm test` | Executa testes Vitest |
| `pnpm check` | Verifica tipos TypeScript |
| `pnpm format` | Formata código com Prettier |

---

## Rotas da Aplicação

### Públicas (Cliente)

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `Home.tsx` | Cardápio com todos os produtos |
| `/produto/:id` | `ProductDetail.tsx` | Detalhe do produto com adicionais |
| `/checkout` | `Checkout.tsx` | Formulário de pedido e pagamento |
| `/pedido/:id` | `OrderTracking.tsx` | Rastreamento em tempo real |
| `/cadastro` | `Register.tsx` | Cadastro de cliente |
| `/app` ou `/instalar` | `AppDownload.tsx` | Instruções de instalação PWA |

### Autenticadas (Cliente Logado)

| Rota | Componente | Descrição |
|---|---|---|
| `/meus-pedidos` | `MeusPedidos.tsx` | Histórico de pedidos do cliente |

### Administrativas (Role: admin)

| Rota | Componente | Descrição |
|---|---|---|
| `/admin/login` | `AdminLogin.tsx` | Login do administrador |
| `/admin` | `AdminDashboard.tsx` | Painel de pedidos em tempo real |
| `/admin/cardapio` | `AdminCardapio.tsx` | CRUD de produtos e adicionais |
| `/admin/relatorios` | `AdminRelatorios.tsx` | Gráficos e métricas de vendas |
| `/admin/configuracoes` | `AdminConfiguracoes.tsx` | Configurações da loja |

---

## API tRPC

Todos os endpoints são definidos em `server/routers.ts` e consumidos via hooks `trpc.*.useQuery` / `trpc.*.useMutation` no frontend. Não há chamadas REST manuais — o contrato é 100% tipado de ponta a ponta.

### Procedures Públicas

```typescript
trpc.products.list          // Lista todos os produtos disponíveis
trpc.products.getWithAddons // Produto + categorias + adicionais por ID
trpc.orders.create          // Cria novo pedido
trpc.orders.getById         // Consulta pedido por ID (rastreamento)
trpc.customers.getByPhone   // Busca cliente por telefone
trpc.customers.create       // Cadastra novo cliente
```

### Procedures Protegidas (Usuário Logado)

```typescript
trpc.auth.me                // Dados do usuário atual
trpc.auth.logout            // Encerra sessão
trpc.myOrders.list          // Histórico de pedidos do usuário logado
```

### Procedures Administrativas (Role: admin)

```typescript
trpc.orders.list            // Lista todos os pedidos
trpc.orders.updateStatus    // Atualiza status do pedido
trpc.products.create        // Cria produto
trpc.products.update        // Atualiza produto
trpc.products.toggleAvailability  // Ativa/desativa produto
trpc.addonCategories.*      // CRUD de categorias de adicionais
trpc.addons.*               // CRUD de adicionais
trpc.reports.statsByDay     // Pedidos agrupados por dia
trpc.reports.statsByPayment // Distribuição por forma de pagamento
trpc.reports.summary        // Métricas gerais (total, faturamento, ticket)
trpc.delivery.*             // Gestão de entregadores
trpc.storeConfig.get        // Lê configurações da loja
trpc.storeConfig.save       // Salva configurações da loja
```

---

## Design System

A identidade visual segue a marca do Recanto do Açaí com uma paleta roxa e dourada, tipografia arredondada e elementos visuais consistentes.

### Paleta de Cores (OKLCH)

| Token | Valor | Uso |
|---|---|---|
| `PURPLE` | `oklch(0.38 0.22 305)` | Cor primária — headers, botões principais |
| `PURPLE_DARK` | `oklch(0.28 0.20 305)` | Hover e estados ativos |
| `GOLD` | `oklch(0.77 0.19 90)` | Destaque — preços, CTAs secundários |
| `WHITE` | `oklch(0.99 0 0)` | Fundos de cards e textos sobre roxo |
| `DARK` | `oklch(0.12 0 0)` | Texto principal |

### Tipografia

A fonte principal é **Nunito** (Google Fonts), carregada via CDN no `index.html`. Pesos utilizados: 400 (regular), 700 (bold) e 900 (black). Títulos e labels usam `font-black` para máxima legibilidade.

### Animações

As animações globais são definidas em `client/src/index.css`:

- `animate-page-enter` — fade + slide suave ao entrar em uma página
- `animate-slide-up` — entrada em cascata dos cards de produto
- `animate-cart-bounce` — feedback ao adicionar item ao carrinho
- `animate-shimmer` — skeleton loader com efeito de brilho

### PWA

O manifesto em `client/public/manifest.json` configura nome, cores e ícones (192×192 e 512×512) para instalação no celular. O Service Worker em `client/public/sw.js` habilita suporte offline básico.

---

## Pagamentos com Stripe

O fluxo de pagamento online usa Stripe Checkout Session:

1. O cliente seleciona "Cartão Online" no checkout.
2. O frontend chama `trpc.orders.createStripeCheckout` com os dados do pedido.
3. O backend cria uma `checkout.session` no Stripe e retorna a URL.
4. O frontend abre a URL em nova aba (`window.open`).
5. Após o pagamento, o Stripe redireciona para `/pedido/:id`.
6. O webhook `/api/stripe/webhook` processa o evento `checkout.session.completed` e atualiza o `stripePaymentIntentId` no pedido.

Para testes, use o cartão `4242 4242 4242 4242` com qualquer data futura e CVV.

---

## Testes

Os testes são escritos com Vitest e ficam em `server/*.test.ts`.

```bash
pnpm test
```

Testes existentes:
- `server/auth.logout.test.ts` — fluxo de logout OAuth
- `server/orders.test.ts` — criação e listagem de pedidos

---

## Changelog

### v1.5.0 — Configurações da Loja
- Nova página `/admin/configuracoes` com 5 grupos: Informações da Loja, Endereço, Horário de Funcionamento, Entrega e Preços, Mensagens
- Tabela `storeSettings` criada no banco com upsert por chave
- Item "Configurações" no sidebar admin ativado

### v1.4.0 — Meus Pedidos e Navegação
- Página `/meus-pedidos` com histórico de pedidos do cliente logado
- Botão "Repetir Pedido" que adiciona todos os itens ao carrinho
- Header redesenhado com links visíveis: Instalar App, Meus Pedidos, Entrar
- Menu hamburguer mobile com cards grandes e touch-friendly

### v1.3.0 — Página por Produto e Adicionais
- Rota `/produto/:id` com seleção de adicionais por categoria
- Suporte a seleção única (radio) e múltipla (checkbox) com validação
- Exibição de adicionais no carrinho, admin e dashboard do entregador
- Admin: painel lateral de CRUD de adicionais por produto

### v1.2.0 — Dashboard do Entregador e Relatórios
- Painel do entregador com login por PIN, lista de pedidos e botões de status
- Relatórios com gráficos Recharts (pedidos por dia, distribuição por pagamento)
- Métricas em tempo real no topo do painel admin

### v1.1.0 — Identidade Visual e PWA
- Redesign completo com identidade do Recanto do Açaí (roxo + dourado)
- Fonte Nunito, logo oficial, ícones personalizados via CDN
- PWA com manifest.json, service worker e página de instalação
- Splash screen animada na abertura do app

### v1.0.0 — Lançamento Inicial
- Cardápio digital com carrinho e checkout
- Integração Stripe para pagamento online
- Painel admin com gestão de pedidos e status
- Rastreamento em tempo real via polling
- Notificação ao dono ao receber novo pedido

---

## Licença

MIT © 2026 Recanto do Açaí
