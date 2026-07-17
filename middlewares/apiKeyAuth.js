import crypto from 'crypto';

export function apiKeyAuth(req, res, next) {
  const expectedKey = process.env.API_KEY;
  if (!expectedKey) {
    return res.status(500).json({ mensaje: 'API_KEY no está configurada en el servidor' });
  }

  const providedKey = req.header('x-api-key');
  if (!providedKey) {
    return res.status(401).json({ mensaje: 'Falta la API key (header x-api-key)' });
  }

  const provided = Buffer.from(providedKey);
  const expected = Buffer.from(expectedKey);

  const valido = provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  if (!valido) {
    return res.status(401).json({ mensaje: 'API key inválida' });
  }

  next();
}
