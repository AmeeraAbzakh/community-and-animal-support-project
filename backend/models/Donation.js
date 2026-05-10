const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Donation = db.define('Donation', {
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  campaignId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Donation;