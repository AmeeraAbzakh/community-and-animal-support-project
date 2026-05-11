const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CaseScore = sequelize.define('CaseScore', {
  finalScore: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  label: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  summary: { 
    type: DataTypes.TEXT 
  },
  rawScores: { 
    type: DataTypes.TEXT 
  }
});

module.exports = CaseScore;