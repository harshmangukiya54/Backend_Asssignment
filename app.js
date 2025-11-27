require('dotenv').config();
const express = require('express');
const bodyParser = require('express').json;
const orgRoutes = require('./routes/orgRoutes');
const errorHandler = require('./middleware/errorHandler');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser());

// mount API routes
app.use('/', orgRoutes);

// simple root health-check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Organization Management Service is running' });
});

// centralized error handler
app.use(errorHandler);

module.exports = app;
