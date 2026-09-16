require('dotenv').config();

const express = require('express');
const taskRoutes = require('./routes/taskRoutes');
const taskModel = require('./models/taskModel');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

taskModel.initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Task API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to initialize MySQL database:', error.message);
    process.exit(1);
  });
