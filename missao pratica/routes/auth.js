// routes/auth.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');
const { isBlocked, addAttempt } = require('../middleware/login-block');
const users = require('../data/users');
const { SECRET_KEY, TOKEN_EXPIRATION } = require('../utils/config');

const router = express.Router();

router.post('/login', 
  [ check('username').notEmpty(), check('password').notEmpty() ], 
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    const blockDetails = isBlocked(username);
    if (blockDetails) {
      return res.status(403).json({ 
        message: 'Conta bloqueada após múltiplas tentativas falhas',
        unblockIn: blockDetails.unblockIn.toFixed(1),
        blockStartTime: blockDetails.blockStartTime
      });
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      addAttempt(username);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, perfil: user.perfil }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
    res.json({ token });
  }
);

router.get('/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
});

module.exports = router;
