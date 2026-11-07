const jwt = require('jsonwebtoken');

module.exports = function autenticacao(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;
  if (!token) return res.status(401).json({ erro: 'Sessão não iniciada.' });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SEGREDO || 'segredo-dev');
    next();
  } catch {
    res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
  }
};
