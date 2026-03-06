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
