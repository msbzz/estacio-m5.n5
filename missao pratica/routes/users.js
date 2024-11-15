// routes/users.js
const express = require('express');
const users = require('../data/users');
const { authenticateToken, isReleased } = require('../middleware/auth');

const router = express.Router();

router.get('/', [authenticateToken, isReleased], (req, res) => {
  if (req.user.perfil === 'admin') {
    res.json(users);
  } else {
    const user = users.find(u => u.id === req.user.id);
    res.json(user);
  }
});

module.exports = router;
