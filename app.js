require('dotenv').config();
const express = require('express');
const bodyParser = require('express').json;
const orgRoutes = require('./routes/orgRoutes');

const app = express();
app.use(bodyParser());

// mount API routes
app.use('/', orgRoutes);

// simple root health-check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Organization Management Service is running' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
