require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // هاد السطر اللي بخلّي المتصفح يشوف شاشات الـ HTML ويفتحها

// Models
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const CaseScore = require('./models/CaseScore');
const Donation = require('./models/Donation');

// Associations
Campaign.hasOne(CaseScore, { foreignKey: 'campaignId' });
CaseScore.belongsTo(Campaign, { foreignKey: 'campaignId' });
Campaign.hasMany(Donation, { foreignKey: 'campaignId', constraints: false });
Donation.belongsTo(Campaign, { foreignKey: 'campaignId', constraints: false });
User.hasMany(Campaign, { foreignKey: 'userId' });
Campaign.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Donation, { foreignKey: 'userId' });
Donation.belongsTo(User, { foreignKey: 'userId' });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/cases', require('./routes/cases'));

// DB + Server
const db = require('./config/database');
db.authenticate()
  .then(() => {
    console.log('Database connected');
    return db.sync(); 
  })
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  })
  .catch(err => {
    console.log('Database error:', err.message);
  });