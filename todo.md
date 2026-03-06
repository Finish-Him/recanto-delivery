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
