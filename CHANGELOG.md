# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.5.0] — 2026-03-06

### Adicionado
- Página `/admin/configuracoes` com formulário completo de configurações da loja
- Tabela `storeSettings` no banco de dados com estrutura chave-valor e upsert automático
- 5 grupos de configurações: Informações da Loja, Endereço, Horário de Funcionamento, Entrega e Preços, Mensagens
- Grupos expansíveis/colapsáveis com ícones por categoria
- Botão "Salvar" no topo e no rodapé da página com feedback visual
- Item "Configurações" no sidebar admin ativado (era placeholder)

### Alterado
- `DashboardLayout.tsx`: item "Configurações" removido do estado `placeholder: true`

---

## [1.4.0] — 2026-03-06

### Adicionado
- Página `/meus-pedidos` com histórico de pedidos do cliente logado
- Cards expansíveis com itens, adicionais, observações e status visual
- Botão "Repetir Pedido" que adiciona todos os itens ao carrinho com um clique
- Estado vazio com CTA para o cardápio
- Campo `userId` na tabela `orders` para vincular pedidos a usuários logados
- Procedure `trpc.myOrders.list` (protectedProcedure)
- Menu de navegação visível no header: "Instalar App", "Meus Pedidos", "Entrar"
- Menu hamburguer mobile com cards grandes e touch-friendly
- Links "Criar conta" e "Instalar App" movidos do rodapé para o header

### Alterado
- `Home.tsx`: header redesenhado com barra de navegação secundária
- `Home.tsx`: rodapé simplificado (removidos links duplicados)
- `App.tsx`: rota `/meus-pedidos` registrada

---

## [1.3.0] — 2026-02-28

### Adicionado
- Página dedicada por produto `/produto/:id` com foto, descrição e adicionais
- Tabelas `addonCategories` e `addons` no schema
- Seleção de adicionais: único (radio) ou múltiplo (checkbox) por categoria
- Validação de mínimo e máximo de seleções por categoria
- Campo de observações livres por item
- Cálculo automático de subtotal com adicionais
- CRUD de adicionais no painel admin (`/admin/cardapio`)
- Exibição de adicionais e observações no carrinho, admin e entregador
- Campos `addonsJson` e `notes` na tabela `orderItems`
- Animações de transição: `page-enter`, `slide-up`, `shimmer`, `cart-bounce`
- Skeleton loaders nos cards de produto e página de detalhe
- Componente `SplashScreen` com logo e animação de entrada

### Alterado
- `CartContext.tsx`: suporte a adicionais e observações por item
- `CartDrawer.tsx`: exibição de adicionais e observações
- `AdminDashboard.tsx`: exibição de adicionais no card do pedido
- `Home.tsx`: clicar no card navega para `/produto/:id`

---

## [1.2.0] — 2026-02-20

### Adicionado
- Dashboard do entregador com login por PIN (`/entregador/login`)
- Lista de pedidos atribuídos ao entregador com botões de status
- Tabela `deliveryPersons` com PIN, CPF, turno e data de admissão
- Campo `deliveryPersonId` na tabela `orders`
- Página `/admin/relatorios` com gráficos Recharts
- Cards de métricas: pedidos hoje, faturamento, ticket médio, pedidos ativos
- Gráfico de pedidos por dia (últimos 7 e 30 dias)
- Gráfico de distribuição por forma de pagamento
- Seletor de entregador no card do pedido (admin)
- Filtro por entregador no painel de pedidos
- Busca por nome/telefone/endereço/#ID no painel admin
- Botões de avanço rápido de status (um clique)
- Página `/admin/entregadores` com perfil completo e métricas

### Alterado
- `AdminDashboard.tsx`: upgrade completo com métricas em tempo real
- `DashboardLayout.tsx`: sidebar com grupos coloridos e ícones personalizados

---

## [1.1.0] — 2026-02-10

### Adicionado
- Redesign completo com identidade visual do Recanto do Açaí
- Logo oficial integrado via CDN
- Fonte Nunito (Google Fonts) em todos os componentes
- Paleta de cores: roxo profundo + dourado + branco
- Ícones personalizados para carrinho, pedidos, cardápio, entregadores, relatórios
- PWA: `manifest.json`, service worker, ícones 192×192 e 512×512
- Página `/app` com instruções de instalação para iOS e Android
- Página `/cadastro` para cadastro de clientes sem OAuth
- Campo "troco para" no checkout quando pagamento em dinheiro
- Rodapé com WhatsApp clicável e link discreto para o painel admin
- Otimização mobile: áreas de toque ≥ 48px, sidebar colapsável

### Alterado
- Removida estética Memphis (fundo pêssego, formas geométricas)
- `AdminDashboard.tsx`: nova identidade visual roxa/dourada
- `CartDrawer.tsx`: redesign com nova paleta
- `Checkout.tsx`: redesign com nova paleta

---

## [1.0.0] — 2026-01-30

### Adicionado
- Cardápio digital com cards de produto e carrinho lateral
- Checkout com nome, endereço, bairro, complemento e forma de pagamento
- Integração Stripe Checkout Session para pagamento online
- Webhook Stripe para processar `checkout.session.completed`
- Página de rastreamento `/pedido/:id` com timeline e polling a cada 15s
- Painel admin `/admin` com lista de pedidos em tempo real
- Atualização de status do pedido (pendente → confirmado → em preparo → saiu → entregue → cancelado)
- Notificação ao dono via Manus Notification ao receber novo pedido
- Autenticação OAuth Manus com `protectedProcedure` e `adminProcedure`
- Seed automático de produtos ao iniciar com banco vazio
- Testes Vitest: logout, criação e listagem de pedidos
