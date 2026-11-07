// Limita tentativas por IP (em memória) para proteger o login e o registo contra adivinhação de senhas.
const registos = new Map();

module.exports = function limitarTentativas({ janelaMs = 60 * 1000, max = 10 } = {}) {
  setInterval(() => {
    const agora = Date.now();
    for (const [chave, r] of registos) if (agora > r.fim) registos.delete(chave);
  }, janelaMs).unref();

  return (req, res, next) => {
    const rota = req.route ? req.route.path : req.path; // padrão da rota (ex.: /produtos/:id/avaliacoes)
    const chave = `${req.ip}|${req.method}|${req.baseUrl}${rota}`;
    const agora = Date.now();
    let r = registos.get(chave);
    if (!r || agora > r.fim) { r = { n: 0, fim: agora + janelaMs }; registos.set(chave, r); }
    r.n += 1;
    if (r.n > max) {
      res.set('Retry-After', String(Math.ceil((r.fim - agora) / 1000)));
      return res.status(429).json({ erro: 'Demasiadas tentativas. Aguarde um minuto e tente de novo.' });
    }
    next();
  };
};
