# Recanto Delivery - TODO

## Backend / Banco de Dados
- [x] Schema: tabela `products` (cardápio)
- [x] Schema: tabela `orders` (pedidos com status)
- [x] Schema: tabela `order_items` (itens do pedido)
- [x] Seed: produto de exemplo (Açaí Tradicional)
- [x] API: listar produtos (publicProcedure)
- [x] API: criar pedido (publicProcedure)
- [x] API: listar pedidos (protectedProcedure - admin)
- [x] API: atualizar status do pedido (protectedProcedure - admin)
- [x] Notificação ao dono ao receber novo pedido

## Frontend - Cardápio (Cliente)
- [x] Página inicial com estética Memphis vibrante
- [x] Componente de card de produto
- [x] Carrinho de compras (estado global, sem login)
- [x] Drawer/sidebar do carrinho
- [x] Página de checkout com nome, endereço e forma de pagamento
- [x] Integração Stripe (cartão crédito/débito)
- [x] Página de confirmação de pedido

## Frontend - Dashboard (Admin)
- [x] Rota protegida /admin
- [x] Lista de pedidos em tempo real (polling)
- [x] Card de pedido com detalhes completos
- [x] Botões de atualização de status
- [x] Filtro por status

## Design System
- [x] Paleta Memphis: fundo pêssego, menta, lilás, amarelo
- [x] Formas geométricas decorativas (SVG)
- [x] Tipografia bold sans-serif maiúscula
- [x] Responsividade mobile-first

## Stripe
- [x] Configurar integração Stripe
- [x] Criar PaymentIntent no backend
- [x] Componente de pagamento com cartão no checkout

## Testes
- [x] Teste de criação de pedido
- [x] Teste de listagem de produtos

## Entrega
- [x] Checkpoint final

## Redesign - Identidade Visual da Marca
- [x] Upload do logo oficial do Recanto do Açaí
- [x] Atualizar CSS global: roxo profundo, amarelo dourado, fundo branco
- [x] Trocar fonte para Nunito (arredondada, bold) alinhada ao logo
- [x] Remover estética Memphis e substituir por identidade da marca
- [x] Redesenhar header com logo real e cores da marca
- [x] Redesenhar cards de produto com identidade roxa/dourada
- [x] Redesenhar carrinho (drawer) com nova identidade
- [x] Redesenhar checkout com nova identidade
- [x] Redesenhar dashboard admin com nova identidade

## Novos Produtos e Frete
- [x] Inserir produtos: Açaí de Garrafa 300ml, Açaí de Garrafa 500ml, Açaí de KitKat 500ml, Açaí Tradicional 300ml, Açaí Tradicional 500ml, Combo Irresístível
- [x] Adicionar taxa de frete R$4,90 no schema (deliveryFee)
- [x] Exibir frete no carrinho e no checkout
- [x] Incluir frete no total do pedido
- [x] Configurar acesso admin para testes

## Correções e Melhorias
- [x] Corrigir imagem do Açaí Tradicional (estava mostrando prato asiático)
- [x] Criar página de login dedicada /login para o painel admin

## Rodapé e Rastreamento
- [x] Link discreto "Painel Admin" no rodapé da página Home
- [x] API pública de consulta de status do pedido por ID
- [x] Página /pedido/:id com rastreamento em tempo real (polling)
- [x] Timeline visual de status (Pendente → Confirmado → Em Preparo → Saiu → Entregue)
- [x] Redirecionar automaticamente para /pedido/:id após finalizar o checkout

## Bugs de Login
- [x] Corrigir erro no login admin/admin (rota /api/dev/login-as-admin)
- [x] Corrigir redirecionamento OAuth Manus (deve ir para /admin após login)

## Otimização Mobile
- [x] Home: ícones maiores, espaçamento touch-friendly, header compacto
- [x] CartDrawer: botões e ícones com área de toque adequada
- [x] AdminLogin: formulário centralizado e bem enquadrado no mobile
- [x] Checkout: campos de formulário com altura mínima 48px, labels legíveis
- [x] OrderTracking: timeline vertical responsiva, texto legível
- [x] AdminDashboard: sidebar colapsável, cards de pedido otimizados para mobile

## Dados de Contato
- [x] Atualizar número de WhatsApp para (21) 98174-9450 em todas as telas

## PWA e Cadastro
- [x] Gerar favicon.ico e ícones PWA (192x192, 512x512) com o logo do Recanto
- [x] Configurar manifest.json com nome, cores e ícones da marca
- [x] Registrar service worker para suporte PWA offline
- [x] Criar página de cadastro de clientes /cadastro
- [x] Criar página de instalação PWA /instalar com instruções iOS e Android
- [x] Adicionar link "Instalar App" no header/rodapé

## Melhorias - Checkout, Cardápio e Admin
- [x] Campo "troco para" no checkout quando pagamento em dinheiro
- [x] Atualizar API/schema para salvar valor do troco no pedido
- [x] Remover imagens de todos os produtos (placeholder visual limpo)
- [x] Expandir sidebar do admin com menus organizados por seção

## Admin - Cardápio (CRUD de Produtos)
- [x] API: criar produto (adminProcedure)
- [x] API: atualizar produto (adminProcedure)
- [x] API: ativar/desativar produto (adminProcedure)
- [x] Página /admin/cardapio com lista de produtos
- [x] Modal/formulário para adicionar novo produto
- [x] Modal/formulário para editar produto existente
- [x] Toggle para ativar/desativar produto
- [x] Remover placeholder "Em breve" do item Cardápio no sidebar

## Admin - Relatórios de Vendas
- [x] API: dados de pedidos agrupados por dia (adminProcedure)
- [x] API: faturamento total e métricas gerais (adminProcedure)
- [x] Página /admin/relatorios com gráficos
- [x] Gráfico de pedidos por dia (últimos 7 e 30 dias)
- [x] Cards de métricas: total de pedidos, faturamento, ticket médio
- [x] Gráfico de distribuição por forma de pagamento
- [x] Remover placeholder "Em breve" do item Relatórios no sidebar

## Dashboard do Entregador
- [x] Adicionar role "entregador" no schema de usuários
- [x] Adicionar tabela de entregadores (nome, telefone, ativo)
- [x] Adicionar campo deliveryPersonId na tabela de pedidos
- [x] Migrar schema com pnpm db:push
- [x] API: login do entregador (por código/PIN)
- [x] API: listar pedidos atribuídos ao entregador
- [x] API: atualizar status de entrega (saiu_entrega → entregue)
- [x] API: listar todos os entregadores (admin)
- [x] API: atribuir pedido a entregador (admin)
- [x] Página /entregador/login com autenticação por PIN
- [x] Layout próprio do entregador (mobile-first, sem sidebar)
- [x] Página /entregador/dashboard com pedidos do dia
- [x] Card de pedido com endereço, cliente, itens e mapa/link
- [x] Botão "Confirmar Retirada" (em_preparo → saiu_entrega)
- [x] Botão "Confirmar Entrega" (saiu_entrega → entregue)
- [x] Seção de contato com a loja (WhatsApp direto)
- [x] Exibir dados completos do cliente (nome, telefone, endereço)
- [x] Link para abrir endereço no Google Maps / Waze
- [x] Admin: página /admin/entregadores para gerenciar entregadores
- [x] Admin: botão para atribuir pedido a entregador no dashboard

## Admin - Seletor de Entregador no Painel de Pedidos
- [x] Exibir entregador atual no card/detalhe do pedido no admin
- [x] Seletor dropdown de entregadores ativos no card do pedido
- [x] Atribuir/reatribuir entregador com um clique (sem modal separado)
- [x] Feedback visual imediato ao atribuir (otimistic update)
- [x] Exibir badge do entregador no card do pedido na lista

## Sidebar Admin - Cores e Visual
- [x] Colorir ícones e labels dos menus com paleta roxo/dourado
- [x] Destacar item ativo com fundo roxo e texto branco
- [x] Colorir grupos/seções do sidebar com cor de destaque
- [x] Hover com efeito visual na paleta atual
- [x] Submenus com indentação e cor diferenciada

## Backend Entregadores - Perfil Completo
- [x] Adicionar campos: CPF, data de admissão, turno, observações no schema
- [x] Migrar banco com pnpm db:push
- [x] API: retornar histórico de pedidos entregues por entregador
- [x] API: métricas de desempenho (total entregas, faturamento, ticket médio)
- [x] Página AdminEntregadores: exibir perfil completo com histórico e métricas
- [x] Formulário de cadastro com campos completos (CPF, turno, admissão)

## Ícones Personalizados (Nano Banana)
- [x] Gerar ícone: açaí/tigela (menu principal)
- [x] Gerar ícone: carrinho de compras estilizado
- [x] Gerar ícone: entregador de moto
- [x] Gerar ícone: dashboard/painel admin
- [x] Gerar ícone: cardápio/menu
- [x] Gerar ícone: relatórios/gráfico
- [x] Gerar logomarca personalizada para o app
- [x] Upload para CDN e integrar na aplicação

## Tela de Carregamento (Splash Screen)
- [x] Criar componente SplashScreen com logo e animação
- [x] Integrar no App.tsx (exibir na abertura)
- [x] Animação de entrada e saída suave

## Botões de Voltar
- [x] Checkout → já tinha botão de voltar
- [x] OrderTracking → já tinha botão de voltar
- [x] DeliveryLogin → já tinha botão de voltar
- [x] DeliveryDashboard → já tinha botão de logout
- [x] AdminCardapio → usa DashboardLayout (navegação pelo sidebar)
- [x] AdminRelatorios → usa DashboardLayout (navegação pelo sidebar)
- [x] AdminEntregadores → usa DashboardLayout (navegação pelo sidebar)
- [x] Componente BackButton reutilizável criado

## Upgrade Dashboard Admin
- [x] Cards de métricas em tempo real (pedidos hoje, faturamento, ticket médio, ativos)
- [x] Filtro por entregador no painel de pedidos
- [x] Busca por nome do cliente, endereço, telefone ou #ID
- [x] Ação rápida: botão de avanço de status com um clique
- [x] Link WhatsApp clicável no card do cliente
- [x] Link Google Maps clicável no endereço do pedido
- [x] Exibir troco no card do pedido
- [x] Contador de pedidos por status no topo (clicável como filtro)
