const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'community_support_db',
  'root',
  'root1234',
  {
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;
