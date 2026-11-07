const db = require('../db');

// Usar depois de "autenticacao". Confirma o papel na base de dados (não só no token),
// para que um admin despromovido perca o acesso de imediato.
module.exports = async function somenteAdmin(req, res, next) {
  const [l] = await db.query('SELECT papel FROM usuarios WHERE id = ?', [req.usuario.id]);
  if (!l.length || l[0].papel !== 'admin')
    return res.status(403).json({ erro: 'Acesso reservado a administradores.' });
  next();
};
