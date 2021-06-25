const Sequelize = require('sequelize');
const db = require('./database');

const Questions = db.define('questions', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    validate: {
      isInt: true,
    },
  },
  product_id: {
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
      notEmpty: true,
    },
  },
  date_written: {
    type: Sequelize.BIGINT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  asker_name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  asker_email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  reported: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    validate: {
      isInt: true,
    },
  },
  helpful: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: true,
    },
  },
}, {
  timestamps: false,
});

module.exports = Questions;
