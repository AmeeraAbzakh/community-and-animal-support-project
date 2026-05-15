const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
// 1. لازم تستوردي موديل المستخدم هنا عشان العلاقات تشتغل
const User = require('./User'); 

const Campaign = sequelize.define('Campaign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.ENUM('human', 'animal'), allowNull: false },
  urgency: { type: DataTypes.ENUM('critical', 'high', 'medium', 'low'), allowNull: false },
  income_level: { type: DataTypes.ENUM('very_low', 'low', 'medium'), allowNull: false },
  health_condition: { type: DataTypes.ENUM('critical', 'serious', 'moderate'), allowNull: false },
  family_size: { type: DataTypes.INTEGER, allowNull: false },
  location: { type: DataTypes.STRING(200), allowNull: false },
  goal_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  current_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  priority_score: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'completed', 'paused'), defaultValue: 'active' },
}, {
  tableName: 'campaigns',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

// 2. تعريف العلاقات (تأكدي أن اسم الموديل User مستورد فوق)
Campaign.belongsTo(User, { foreignKey: 'user_id', as: 'creator' });
User.hasMany(Campaign, { foreignKey: 'user_id', as: 'campaigns' });

module.exports = Campaign;