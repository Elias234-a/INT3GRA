const express = require('express');
const cors = require('cors');
const { evaluate, parse, derivative, simplify } = require('mathjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/solver', require('./routes/solver'));
app.use('/api/advanced-solver', require('./routes/advanced-solver'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/cases', require('./routes/cases'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'INTEGRA Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});