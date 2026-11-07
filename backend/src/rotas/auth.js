const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const autenticacao = require('../middlewares/autenticacao');
const limitarTentativas = require('../middlewares/limitarTentativas');

const limite = limitarTentativas({ max: 10 });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const segredo = () => process.env.JWT_SEGREDO || 'segredo-dev';
const gerarToken = (u) => jwt.sign({ id: u.id, nome: u.nome, email: u.email, papel: u.papel }, segredo(), { expiresIn: '7d' });

router.post('/registo', limite, async (req, res) => {
  const nome = String(req.body?.nome || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const senha = String(req.body?.senha || '');
  if (nome.length < 2 || nome.length > 120) return res.status(400).json({ erro: 'Indique o seu nome (2 a 120 caracteres).' });
  if (!EMAIL.test(email) || email.length > 150) return res.status(400).json({ erro: 'Indique um email válido.' });
  // o bcrypt só usa os primeiros 72 caracteres da senha
  if (senha.length < 6 || senha.length > 72) return res.status(400).json({ erro: 'A senha deve ter entre 6 e 72 caracteres.' });
  const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existe.length) return res.status(409).json({ erro: 'Este email já está registado.' });
  const hash = await bcrypt.hash(senha, 10);
  const [r] = await db.query('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?,?,?)', [nome, email, hash]);
  const usuario = { id: r.insertId, nome, email, papel: 'cliente' };
  res.status(201).json({ usuario, token: gerarToken(usuario) });
});

router.post('/entrar', limite, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const senha = String(req.body?.senha || '');
  const [linhas] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  const u = linhas[0];
  if (!u || !(await bcrypt.compare(senha, u.senha_hash)))
    return res.status(401).json({ erro: 'Email ou senha incorretos.' });
  const usuario = { id: u.id, nome: u.nome, email: u.email, papel: u.papel };
  res.json({ usuario, token: gerarToken(usuario) });
});

// Confirma que a sessão ainda é válida (o site/app usam isto ao abrir)
router.get('/eu', autenticacao, async (req, res) => {
  const [l] = await db.query('SELECT id, nome, email, papel FROM usuarios WHERE id = ?', [req.usuario.id]);
  if (!l.length) return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
  res.json(l[0]);
});

module.exports = router;
