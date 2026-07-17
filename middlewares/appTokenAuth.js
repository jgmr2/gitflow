import jwt from 'jsonwebtoken';

const APP_TOKEN_SCOPE = 'app-token';

export function appTokenAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ mensaje: 'JWT_SECRET no está configurado en el servidor' });
  }

  const token = req.header('app-token');
  if (!token) {
    return res.status(401).json({ mensaje: 'Falta el application token (header app-token)' });
  }

  try {
    const payload = jwt.verify(token, secret);
    if (payload.scope !== APP_TOKEN_SCOPE) {
      return res.status(401).json({ mensaje: 'Application token inválido' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Application token inválido' });
  }
}
