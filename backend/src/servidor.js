require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

if (!process.env.JWT_SEGREDO) {
  if (process.env.NODE_ENV === 'production') {
    console.error('Defina JWT_SEGREDO no ficheiro .env antes de iniciar em produção.');
    process.exit(1);
  }
  console.warn('⚠️  JWT_SEGREDO não definido no .env: a usar um segredo de desenvolvimento (inseguro).');
}

const app = express();
// Atrás de um proxy (Nginx, etc.) defina TRUST_PROXY=1 para o limite de tentativas ver o IP real
app.set('trust proxy', process.env.TRUST_PROXY === '1');
app.disable('x-powered-by');

// CORS_ORIGENS (opcional): lista separada por vírgulas, ex.: https://loja.exemplo.ao,https://admin.exemplo.ao
const origens = (process.env.CORS_ORIGENS || '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: origens.length ? origens : true }));
app.use((req, res, next) => { res.set('X-Content-Type-Options', 'nosniff'); next(); });
app.use(express.json({ limit: '100kb' }));
app.use('/imagens', express.static(path.join(__dirname, '..', 'public', 'imagens'), { maxAge: '7d' }));

app.get('/api/saude', (req, res) => res.json({ estado: 'ok' }));
app.use('/api', require('./rotas/catalogo'));
app.use('/api/auth', require('./rotas/auth'));
app.use('/api/pedidos', require('./rotas/pedidos'));
app.use('/api/admin', require('./rotas/admin'));

// Rotas /api inexistentes
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'Pedido inválido (JSON mal formado).' });
  if (err.type === 'entity.too.large') return res.status(413).json({ erro: 'Pedido demasiado grande.' });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const porta = process.env.PORTA || 4000;
app.listen(porta, () => {
  console.log(`API da Loja Tech a correr em http://localhost:${porta}`);
  db.query('SELECT 1 FROM produtos LIMIT 1')
    .then(() => console.log('Ligação ao MySQL OK.'))
    .catch((e) => console.error(`⚠️  Não foi possível ler a base de dados (${e.code || e.message}).\n   Verifique DB_USUARIO, DB_SENHA e DB_NOME no .env e se importou base-de-dados/loja_tech.sql.`));
});
