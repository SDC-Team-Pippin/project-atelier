const Sequelize = require('sequelize');
const db = require('./database');

const Photos = db.define('photos', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    validate: {
      isInt: true,
    },
  },
  answer_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
    },
  },
  body: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isURL: true,
    },
  },
}, {
  timestamps: false,
});

module.exports = Photos;
