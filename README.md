# loja-tech
Loja online de tecnologia (computadores, telemóveis, auscultadores, consolas, câmaras e relógios inteligentes)
| Parte | Tecnologias |
|---|---|
| **Base de dados** | MySQL |
| **Backend (API)** | Node.js + Express, JWT, bcrypt |
| **Site** | React + Next.js, HTML, CSS, JavaScript |
| **App móvel** | React Native (Expo) |

## Funcionalidades

- Banners promocionais, categorias e produtos recomendados
- Pesquisa por nome e filtro por categoria
- Detalhe do produto: galeria de imagens, avaliação, escolha de modelo/opção e quantidade
- Carrinho (guardado no dispositivo), alterar quantidades e total
- Registo e início de sessão (JWT)
- Finalizar compra com endereço de entrega e histórico de pedidos
- O preço dos pedidos é sempre lido da base de dados, nunca do cliente
- **Preços em Kwanzas (Kz)**, ex.: `85.500 Kz`
- **Pagamento** por **Multicaixa Express**, **Multicaixa** (caixa automático/TPA) ou **presencial** (na entrega ou na loja)
- **Avaliações por estrelas** (1 a 5) com média, distribuição e comentários dos clientes
- **Ecrãs responsivos**: site e app adaptam-se a telemóvel, tablet e computador
- **Design próprio**: identidade verde-azulada "Atlântico" com a etiqueta de preço dourada, ícones desenhados à medida, layout responsivo (telemóvel, tablet e computador) e acessível (teclado, leitores de ecrã)
- **Painel de administração** (`/admin` no site): resumo de vendas, gestão de produtos (com upload de imagens), categorias, banners, pedidos (mudar estado) e lista de clientes
