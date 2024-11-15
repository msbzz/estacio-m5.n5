// middleware/auth.js
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../utils/config');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user.perfil !== 'admin') return res.status(403).json({ message: 'Acesso negado' });
  next();
}

function isReleased(req, res, next) {
  if (req.user.perfil === 'admin' || req.user.perfil === 'user') {
    next();
  } else {
    return res.status(403).json({ message: 'Acesso negado' });
  }
}

module.exports = { authenticateToken, isAdmin, isReleased };
