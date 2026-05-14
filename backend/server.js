const express = require('express');
const app = express();
app.use(express.json());
// 1. استدعاء الموديلات
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const CaseScore = require('./models/CaseScore'); 
const Donation = require('./models/Donation');

// 2. إعداد العلاقات (Associations)
Campaign.hasOne(CaseScore, { foreignKey: 'campaignId' });
CaseScore.belongsTo(Campaign, { foreignKey: 'campaignId' });

Campaign.hasMany(Donation, { foreignKey: 'campaignId' });
Donation.belongsTo(Campaign, { foreignKey: 'campaignId' });

User.hasMany(Campaign, { foreignKey: 'userId' });
Campaign.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Donation, { foreignKey: 'userId' });
Donation.belongsTo(User, { foreignKey: 'userId' });

// --- الأسطر الجديدة اللي لازم تكون موجودة ---
app.use(express.json()); // عشان السيرفر يقدر يقرأ البيانات اللي بنبعتها
app.use('/api/campaigns', require('./routes/campaigns')); // ربط ملف الـ Routes
// ------------------------------------------

app.get('/', (req, res) => {
  res.send('Revobin Server is Ready');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:3000`);
});