// Cria (ou atualiza a senha de) a conta de administrador.
// Uso: npm run criar-admin   (lê ADMIN_NOME, ADMIN_EMAIL e ADMIN_SENHA do ficheiro .env)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

(async () => {
  const nome = process.env.ADMIN_NOME || 'Administrador';
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_SENHA;
  if (!email || !senha || senha.length < 8) {
    console.error('Defina ADMIN_EMAIL e ADMIN_SENHA (mínimo 8 caracteres) no ficheiro .env.');
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production' && senha === 'Admin@12345') {
    console.error('Mude ADMIN_SENHA no .env: a senha de exemplo não pode ser usada em produção.');
    process.exit(1);
  }
  const hash = await bcrypt.hash(senha, 10);
  const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existe.length) {
    await db.query("UPDATE usuarios SET senha_hash = ?, papel = 'admin', nome = ? WHERE email = ?", [hash, nome, email]);
    console.log(`Conta existente atualizada e promovida a administrador: ${email}`);
  } else {
    await db.query("INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES (?,?,?, 'admin')", [nome, email, hash]);
    console.log(`Administrador criado: ${email}`);
  }
  process.exit(0);
})().catch((e) => { console.error('Erro:', e.message); process.exit(1); });
