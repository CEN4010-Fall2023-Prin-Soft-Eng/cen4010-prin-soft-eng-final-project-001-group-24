const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

// Routes
const authRoutes = require('./auth');
const countryRoutes = require('./countries');

app.use('/api', authRoutes);
app.use('/api', countryRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
