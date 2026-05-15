require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./config/database');

const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const donationRoutes = require('./routes/donations');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Revobin Server is Ready! 🚀');
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: false }).then(() => {
  console.log('Database connected!');
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('DB Error:', err.message);
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});