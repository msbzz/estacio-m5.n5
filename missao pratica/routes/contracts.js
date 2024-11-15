// routes/contracts.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { contratos } = require('../data/contracts');

const router = express.Router();

router.get('/all', [authenticateToken, isAdmin], (req, res) => {
  res.json({ contratos });
});

router.get('/', 
  [authenticateToken, isAdmin, check('empresa').optional().isAlphanumeric(), check('inicio').optional().isISO8601()], 
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { empresa, inicio } = req.query;
    let filteredContracts = contratos;

    if (empresa) {
      filteredContracts = filteredContracts.filter(contract => contract.empresa === empresa);
    }
    if (inicio) {
      filteredContracts = filteredContracts.filter(contract => contract.data_inicio === inicio);
    }

    res.json({ contratos: filteredContracts });
  }
);

module.exports = router;
