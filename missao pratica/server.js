// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contractRoutes = require('./routes/contracts');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contracts', contractRoutes);

// app.get('/index.html', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  const now = new Date();
  const formattedDate = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  console.log(`Servidor rodando em http://localhost:3000 - Iniciado em ${formattedDate}`);
});
