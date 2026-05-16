const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Donation = sequelize.define('Donation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  
  // شلنا الـ allowNull خالص عشان نضمن إن الداتابيز ما تعترض
  campaign_id: { type: DataTypes.INTEGER },
  campaignId: { type: DataTypes.INTEGER }, 
  
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, {
  tableName: 'donations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Donation;